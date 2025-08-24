from typing import Any, Dict, List, Optional

from sqlalchemy import func
from sqlalchemy.orm import Session

from common import PaginatedRequest
from models.api.stream import CreateStreamRequest
from models.db.scenario.scenario import Scenario
from models.db.stream.stream import Stream
from models.db.stream.stream_crud import StreamCrud


def get_by_id(session: Session, id: int) -> Optional[Stream]:
    return StreamCrud.get_by_id(session, id)


def group(session: Session) -> dict:
    stream_type_counts = (
        session.query(Stream.stream_type, func.count(Stream.id).label("count"))
        .filter(Stream.is_deleted == 0)  # 忽略逻辑删除
        .group_by(Stream.stream_type)
        .all()
    )

    scenario_counts = (
        session.query(
            func.coalesce(Scenario.name, "未分类").label("name"),
            func.count(Stream.id).label("count"),
        )
        .outerjoin(Scenario, Scenario.id == Stream.scenario_id)
        .filter(Stream.is_deleted == 0)
        .group_by(func.coalesce(Scenario.name, "未分类"))
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


def list_by_scenario(
    session: Session,
    request: PaginatedRequest,
    scenario_id: Optional[int] = 0,
) -> List[Dict[str, Any]]:
    return StreamCrud.list_by_scenario(
        session,
        scenario_id,
        (request.page_num - 1) * request.page_size,
        request.page_size,
    )


def count_by_scenario(session, scenario_id: int) -> int:
    return StreamCrud.count_by_scenario(session, scenario_id)


def catalog(session: Session) -> List[Dict[str, Any]]:
    scenario_counts = (
        session.query(
            Stream.scenario_id.label("scenario_id"),
            func.coalesce(Scenario.name, "未分类").label("name"),
            func.count(Stream.id).label("count"),
        )
        .outerjoin(Scenario, Scenario.id == Stream.scenario_id)
        .filter(Stream.is_deleted == 0)
        .group_by(func.coalesce(Scenario.name, "未分类"))
        .all()
    )

    res = [
        {
            "scenario_id": scenario.scenario_id if scenario.scenario_id else -1,
            "scenario_name": scenario.name,
            "scenario_count": scenario.count,
        }
        for scenario in scenario_counts
    ]

    res.sort(key=lambda x: x["scenario_id"])

    res.insert(
        0,
        {
            "scenario_id": 0,
            "scenario_name": "全部",
            "scenario_count": sum([scenario.count for scenario in scenario_counts]),
        }
    )

    return res
