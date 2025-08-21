from sqlalchemy import func
from sqlalchemy.orm import Session

from models.api.stream import CreateStreamRequest
from models.db.scenario.scenario import Scenario
from models.db.stream.stream import Stream
from models.db.stream.stream_crud import StreamCrud


def group(session) -> dict:
    stream_type_counts = (
        session.query(Stream.stream_type, func.count(Stream.id).label("count"))
        .filter(Stream.is_deleted == 0)  # 忽略逻辑删除
        .group_by(Stream.stream_type)
        .all()
    )

    scenario_counts = (
        session.query(Scenario.name.label("name"), func.count(Stream.id).label("count"))
        .join(Scenario, Scenario.id == Stream.scenario_id)
        .filter(Stream.is_deleted == 0)
        .group_by(Scenario.name)
        .all()
    )

    scenario_counts = [
        {
            "name": scenario.name,
            "count": scenario.count,
        }
        for scenario in scenario_counts
    ]

    stream_type_counts = [
        {
            "stream_type": stream_type,
            "count": count,
        }
        for stream_type, count in stream_type_counts
    ]

    return {
        "stream_type_counts": stream_type_counts,
        "scenario_counts": scenario_counts,
    }


def create_stream(req: CreateStreamRequest, session: Session) -> int:
    d = {
        "name": req.name,
        "description": req.description,
        "stream_path": req.stream_path,
        "stream_type": req.stream_type,
        "scenario_id": req.scenario_id,
        "algo_id": req.algo_id,
    }

    stream = StreamCrud.create(session, d)
    return stream.id


def count(session) -> int:
    return StreamCrud.count(session)