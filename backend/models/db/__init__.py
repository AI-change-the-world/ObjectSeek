from datetime import datetime

from sqlalchemy import inspect
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class ToDictMixin:
    def to_dict(self):
        """将 ORM 实例转为 JSON 可用的 dict"""
        result = {}
        for c in inspect(self).mapper.column_attrs:
            value = getattr(self, c.key)
            if isinstance(value, datetime):
                value = value.isoformat()  # 转成字符串
            result[c.key] = value
        return result
