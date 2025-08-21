from typing import Any, Dict, List, Optional, Union

from sqlalchemy import func
from sqlalchemy.orm import Session

from models.db.scenario.scenario import Scenario

from .stream import Stream


class StreamCrud:
    @staticmethod
    def create(session: Session, obj: Union[Stream, dict]) -> Stream:
        if isinstance(obj, dict):
            obj = Stream(**obj)

        session.add(obj)
        session.commit()
        session.refresh(obj)
        return obj

    @staticmethod
    def get_by_id(session: Session, id: int) -> Optional[Stream]:
        return session.query(Stream).filter_by(id=id, is_deleted=0).first()

    @staticmethod
    def list(session: Session, offset: int = 0, limit: int = 100) -> List[Stream]:
        return (
            session.query(Stream)
            .filter_by(is_deleted=0)
            .order_by(Stream.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    @staticmethod
    def fetch_all(session: Session) -> List[Stream]:
        return session.query(Stream).filter_by(is_deleted=0).all()

    @staticmethod
    def count(session: Session) -> int:
        return session.query(Stream).filter_by(is_deleted=0).count()

    @staticmethod
    def update(session: Session, id: int, updates: dict) -> Optional[Stream]:
        obj = session.query(Stream).filter_by(id=id, is_deleted=0).first()
        if not obj:
            return None
        for key, value in updates.items():
            if hasattr(obj, key):
                setattr(obj, key, value)
        session.commit()
        session.refresh(obj)
        return obj

    @staticmethod
    def soft_delete(session: Session, id: int) -> bool:
        obj = session.query(Stream).filter_by(id=id, is_deleted=0).first()
        if not obj:
            return False
        obj.is_deleted = 1
        session.commit()
        return True

    @staticmethod
    def list_by_scenario(
        session: Session,
        scenario_id: Optional[int] = 0,  # 0 = 全部; -1 = 未分类
        offset: int = 0,
        limit: int = 20,
    ) -> List[Dict[str, Any]]:
        query = (
            session.query(
                Stream.id,
                Stream.name,
                Stream.stream_path,
                Stream.stream_type,
                Stream.description,
                Stream.created_at,
                func.coalesce(Scenario.name, "未分类").label("scenario_name"),
                Stream.scenario_id,
            )
            .outerjoin(Scenario, Scenario.id == Stream.scenario_id)
            .filter(Stream.is_deleted == 0)
        )

        # 如果指定了 scenario_id
        if scenario_id != 0:
            if scenario_id == -1:
                query = query.filter(Stream.scenario_id == None)  # 未分类
            else:
                query = query.filter(Stream.scenario_id == scenario_id)

        items = (
            query.order_by(Stream.created_at.desc()).offset(offset).limit(limit).all()
        )

        return [
            {
                "id": row.id,
                "name": row.name,
                "stream_path": row.stream_path,
                "stream_type": row.stream_type,
                "description": row.description,
                "created_at": row.created_at if row.created_at else None,
                "scenario_id": row.scenario_id,
                "scenario_name": row.scenario_name,
            }
            for row in items
        ]

    @staticmethod
    def count_by_scenario(session, scenario_id:int) -> int:
        if scenario_id == 0:
            return StreamCrud.count(session)
        elif scenario_id == -1:
            return session.query(Stream).filter(Stream.scenario_id.is_(None)).count()
        else:
            return session.query(Stream).filter(Stream.scenario_id == scenario_id).count()
