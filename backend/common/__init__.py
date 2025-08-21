from typing import List

import jieba.analyse

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
    return (
        await s3_operator.to_async_operator().presign_stat(s3_path, expire_second=3600)
    ).url


def jieba_cut(text: str) -> List[str]:
    keywords = jieba.analyse.extract_tags(text, topK=5, withWeight=True)
    return list(k for k, _ in keywords)
