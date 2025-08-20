from sqlalchemy.orm import Session

from common import logger
from models import CreateAlgorithmRequest


def create_algorithm(request: CreateAlgorithmRequest, session: Session) -> int:
    """创建算法"""
    from models.db.algorithm import AlgorithmCrud

    logger.info(f"create algorithm: {request}")
    d = {
        "name": request.name,
        "version": request.version,
        "description": request.description,
    }

    algorithm = AlgorithmCrud.create(session=session, algo=d)
    return algorithm.id
