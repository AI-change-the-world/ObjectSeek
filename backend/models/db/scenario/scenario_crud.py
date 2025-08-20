from typing import List, Optional, Union

from sqlalchemy.orm import Session

from .scenario import Scenario


class ScenarioCrud:
    @staticmethod
    def create(session: Session, obj: Union[Scenario, dict]) -> Scenario:
        if isinstance(obj, dict):
            obj = Scenario(**obj)

        session.add(obj)
        session.commit()
        session.refresh(obj)
        return obj

    @staticmethod
    def get_by_id(session: Session, id: int) -> Optional[Scenario]:
        return session.query(Scenario).filter_by(id=id, is_deleted=0).first()

    @staticmethod
    def list(session: Session, offset: int = 0, limit: int = 100) -> List[Scenario]:
        return (
            session.query(Scenario)
            .filter_by(is_deleted=0)
            .order_by(Scenario.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    @staticmethod
    def count(session: Session) -> int:
        return session.query(Scenario).filter_by(is_deleted=0).count()

    @staticmethod
    def update(session: Session, id: int, updates: dict) -> Optional[Scenario]:
        obj = session.query(Scenario).filter_by(id=id, is_deleted=0).first()
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
        obj = session.query(Scenario).filter_by(id=id, is_deleted=0).first()
        if not obj:
            return False
        obj.is_deleted = 1
        session.commit()
        return True
