import time

from sqlalchemy import Column, Integer, SmallInteger, String, event

from models.db import Base, ToDictMixin


class Algorithm(Base, ToDictMixin):
    __tablename__ = "algorithm"
    __table_args__ = {"comment": "algorithm table"}

    id = Column("algorithm_id", Integer, primary_key=True, autoincrement=True)

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

    name = Column("name", String(20), comment="算法名称")
    description = Column("description", String(1024), comment="算法描述", default="")
    version = Column("version", String(20), comment="算法版本")


@event.listens_for(Algorithm, "before_update", propagate=True)
def update_timestamp_before_update(mapper, connection, target):
    target.updated_at = int(time.time())
