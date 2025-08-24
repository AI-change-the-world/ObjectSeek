import time

from sqlalchemy import Column, Integer, SmallInteger, String, event

from models.db import Base, ToDictMixin


class StreamDetails(Base, ToDictMixin):
    __tablename__ = "stream_details"
    __table_args__ = {"comment": "stream details table"}

    id = Column("id", Integer, primary_key=True, autoincrement=True)
    stream_id = Column("stream_id", Integer, nullable=False)
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
    save_path = Column(
        "save_path",
        String(1024),
        nullable=False,
        comment="保存的S3路径",
    )


@event.listens_for(StreamDetails, "before_update", propagate=True)
def update_timestamp_before_update(mapper, connection, target):
    target.updated_at = int(time.time())
