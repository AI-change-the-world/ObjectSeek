import time
from typing import Dict, Optional, Tuple


class URLCache:
    """预签名URL缓存类"""
    
    def __init__(self, expire_seconds: int = 3600):
        """
        初始化缓存
        
        Args:
            expire_seconds: 缓存过期时间（秒），默认1小时
        """
        self._cache: Dict[str, Tuple[str, float]] = {}
        self._expire_seconds = expire_seconds
    
    def get(self, key: str) -> Optional[str]:
        """
        获取缓存的URL
        
        Args:
            key: 缓存键（S3路径）
            
        Returns:
            缓存的URL，如果不存在或已过期则返回None
        """
        if key not in self._cache:
            return None
        
        url, timestamp = self._cache[key]
        
        # 检查是否过期
        if time.time() - timestamp > self._expire_seconds:
            # 清理过期缓存
            del self._cache[key]
            return None
        
        return url
    
    def set(self, key: str, url: str) -> None:
        """
        设置缓存
        
        Args:
            key: 缓存键（S3路径）
            url: 预签名URL
        """
        self._cache[key] = (url, time.time())
    
    def clear_expired(self) -> None:
        """清理所有过期的缓存项"""
        current_time = time.time()
        expired_keys = []
        
        for key, (_, timestamp) in self._cache.items():
            if current_time - timestamp > self._expire_seconds:
                expired_keys.append(key)
        
        for key in expired_keys:
            del self._cache[key]
    
    def clear_all(self) -> None:
        """清空所有缓存"""
        self._cache.clear()
    
    def size(self) -> int:
        """获取当前缓存项数量"""
        return len(self._cache)


# 全局缓存实例，1小时过期
presign_url_cache = URLCache(expire_seconds=3600)