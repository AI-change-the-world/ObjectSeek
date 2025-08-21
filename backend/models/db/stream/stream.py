import time

from sqlalchemy import Column, Integer, SmallInteger, String, event

from models.db import Base, ToDictMixin


class Stream(Base, ToDictMixin):
    __tablename__ = "stream"
    __table_args__ = {"comment": "stream table"}

    id = Column("stream_id", Integer, primary_key=True, autoincrement=True)

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

    algo_id = Column("algorithm_id", Integer, nullable=True)
    name = Column("name", String(20), nullable=False)
    description = Column("description", String(1024), nullable=True)
    scenario_id = Column("scenario_id", Integer, nullable=True)

    stream_type = Column(
        "stream_type",
        String(20),
        nullable=False,
        comment="数据流类型, 包括 `file`和`stream`",
    )
    stream_path = Column(
        "stream_path",
        String(1024),
        nullable=True,
        comment="数据流路径, 可能是s3路径或者 rtsp 路径",
    )


@event.listens_for(Stream, "before_update", propagate=True)
def update_timestamp_before_update(mapper, connection, target):
    target.updated_at = int(time.time())
