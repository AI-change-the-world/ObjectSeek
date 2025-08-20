from typing import List, Optional, Union

from sqlalchemy.orm import Session

from .algorithm import Algorithm


class AlgorithmCrud:
    @staticmethod
    def create(session: Session, algo: Union[Algorithm, dict]) -> Algorithm:
        if isinstance(algo, dict):
            algo = Algorithm(**algo)

        session.add(algo)
        session.commit()
        session.refresh(algo)
        return algo

    @staticmethod
    def get_by_id(session: Session, id: int) -> Optional[Algorithm]:
        return session.query(Algorithm).filter_by(id=id, is_deleted=0).first()

    @staticmethod
    def list(session: Session, offset: int = 0, limit: int = 100) -> List[Algorithm]:
        return (
            session.query(Algorithm)
            .filter_by(is_deleted=0)
            .order_by(Algorithm.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    @staticmethod
    def count(session: Session) -> int:
        return session.query(Algorithm).filter_by(is_deleted=0).count()

    @staticmethod
    def update(session: Session, id: int, updates: dict) -> Optional[Algorithm]:
        algo = session.query(Algorithm).filter_by(id=id, is_deleted=0).first()
        if not algo:
            return None
        for key, value in updates.items():
            if hasattr(algo, key):
                setattr(algo, key, value)
        session.commit()
        session.refresh(algo)
        return algo

    @staticmethod
    def soft_delete(session: Session, id: int) -> bool:
        algo = session.query(Algorithm).filter_by(id=id, is_deleted=0).first()
        if not algo:
            return False
        algo.is_deleted = 1
        session.commit()
        return True
