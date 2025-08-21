# 全局变量存储
import asyncio
import threading
import traceback
from datetime import datetime
from typing import Any, Dict

from common import logger
from services.algorithm_service import get_wordcloud as algorithm_get_wordcloud
from services.scenario_service import get_wordcloud as scenario_get_wordcloud


class GlobalData:
    def __init__(self):
        self._data: Dict[str, Any] = {}
        self._lock = threading.RLock()  # 可重入锁，支持嵌套
        self.last_update_time: datetime = None

    def update(self, key: str, value: Any):
        """更新单个变量"""
        with self._lock:
            self._data[key] = value

    def bulk_update(self, new_data: Dict[str, Any]):
        """批量更新变量"""
        with self._lock:
            self._data.update(new_data)
            self.last_update_time = datetime.now()

    def get(self, key: str, default: Any = None) -> Any:
        """获取变量"""
        with self._lock:
            return self._data.get(key, default)

    def get_all(self) -> Dict[str, Any]:
        """获取所有变量"""
        with self._lock:
            return self._data.copy()  # 返回副本避免直接修改


# 创建全局数据实例
global_data = GlobalData()


async def set_word_cloud(session):
    logger.info("set word cloud")
    try:
        algo, scenario = await asyncio.gather(
            algorithm_get_wordcloud(session), scenario_get_wordcloud(session)
        )

        new_data = {"algorithm": algo, "scenario": scenario}
        global_data.bulk_update(new_data)
        logger.info("set word cloud success")
    except Exception as e:
        logger.error(f"set word cloud error: {e}")
        traceback.print_exc()


def sync_refresh(session):
    """同步包装器用于APScheduler"""
    asyncio.run(set_word_cloud(session))
