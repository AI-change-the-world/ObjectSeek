import time

from sqlalchemy import Column, Integer, SmallInteger, String, event

from models.db import Base, ToDictMixin


class Scenario(Base, ToDictMixin):
    __tablename__ = "scenario"
    __table_args__ = {"comment": "场景, 用于视频流分类用"}

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(64), nullable=False, comment="场景名称")
    description = Column(String(1024), nullable=True, comment="场景描述")
    created_at = Column(
        Integer, default=lambda: int(time.time()), comment="创建时间(秒级时间戳)"
    )
    updated_at = Column(
        Integer,
        default=lambda: int(time.time()),
        onupdate=lambda: int(time.time()),
        comment="更新时间(秒级时间戳)",
    )
    is_deleted = Column(SmallInteger, default=0, comment="逻辑删除标记")


@event.listens_for(Scenario, "before_update", propagate=True)
def update_timestamp_before_update(mapper, connection, target):
    target.updated_at = int(time.time())
