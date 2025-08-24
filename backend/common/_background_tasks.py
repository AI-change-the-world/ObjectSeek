import asyncio
from typing import Optional
from threading import Thread
import time

from common import logger, clear_expired_cache


class CacheCleanupTask:
    """缓存清理后台任务"""
    
    def __init__(self, interval_seconds: int = 1800):  # 默认30分钟清理一次
        self.interval_seconds = interval_seconds
        self.running = False
        self.task_thread: Optional[Thread] = None
    
    def _cleanup_loop(self):
        """清理循环"""
        while self.running:
            try:
                clear_expired_cache()
                time.sleep(self.interval_seconds)
            except Exception as e:
                logger.error(f"缓存清理任务出错: {e}")
                time.sleep(60)  # 出错后等待1分钟再重试
    
    def start(self):
        """启动清理任务"""
        if not self.running:
            self.running = True
            self.task_thread = Thread(target=self._cleanup_loop, daemon=True)
            self.task_thread.start()
            logger.info(f"缓存清理任务已启动，清理间隔: {self.interval_seconds}秒")
    
    def stop(self):
        """停止清理任务"""
        if self.running:
            self.running = False
            if self.task_thread:
                self.task_thread.join(timeout=5)
            logger.info("缓存清理任务已停止")


# 全局清理任务实例
cache_cleanup_task = CacheCleanupTask()


def start_cache_cleanup():
    """启动缓存清理任务"""
    cache_cleanup_task.start()


def stop_cache_cleanup():
    """停止缓存清理任务"""
    cache_cleanup_task.stop()