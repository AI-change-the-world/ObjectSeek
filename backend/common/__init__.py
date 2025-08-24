import base64
from typing import List

import cv2
import jieba.analyse
import numpy as np

from common._cache import presign_url_cache
from common._config import settings
from common._db import get_session, get_sync_session, init_db
from common._logger import logger
from common._openai import chat_client, chat_model, chat_vlm_model
from common._opendal import s3_operator
from common._req import PaginatedRequest
from common._resp import ApiPageResponse, ApiResponse, ListResponse

init_db()


def download_from_s3(s3_path: str, local_path: str):
    try:
        data = s3_operator.read(s3_path)
        with open(local_path, "wb") as f:
            f.write(data)
    except Exception as e:
        logger.error(f"Error downloading from S3: {e}")
        pass


def upload_to_s3(local_path: str, s3_path: str):
    try:
        with open(local_path, "rb") as f:
            s3_operator.write(s3_path, f.read())
    except Exception as e:
        logger.error(f"Error uploading from S3: {e}")
        pass


async def presign_url(s3_path: str) -> str:
    """
    获取预签名URL，带缓存机制

    Args:
        s3_path: S3文件路径

    Returns:
        预签名URL
    """
    # 先尝试从缓存获取
    cached_url = presign_url_cache.get(s3_path)
    if cached_url:
        logger.info(f"从缓存获取预签名URL: {s3_path}")
        return cached_url

    # 缓存中不存在，生成新的预签名URL
    logger.info(f"生成新的预签名URL: {s3_path}")
    url = (
        await s3_operator.to_async_operator().presign_read(s3_path, expire_second=3600)
    ).url

    # 将新生成的URL存入缓存
    presign_url_cache.set(s3_path, url)

    return url


def jieba_cut(text: str) -> List[str]:
    keywords = jieba.analyse.extract_tags(text, topK=5, withWeight=True)
    return list(k for k, _ in keywords)


def clear_expired_cache() -> None:
    """清理过期的预签名URL缓存"""
    presign_url_cache.clear_expired()
    logger.info(f"已清理过期缓存，当前缓存数量: {presign_url_cache.size()}")


def get_cache_stats() -> dict:
    """获取缓存统计信息"""
    return {
        "cache_size": presign_url_cache.size(),
        "cache_type": "presign_url_cache",
        "expire_seconds": 3600,
    }


def numpy_to_base64(frame: np.ndarray) -> str:
    """
    将 NumPy 数组转换为 base64 编码的字符串。
    """
    _, buffer = cv2.imencode(".png", frame)
    return f"data:image/png;base64,{base64.b64encode(buffer).decode('utf-8')}"
