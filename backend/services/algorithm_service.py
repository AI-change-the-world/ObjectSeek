from sqlalchemy.orm import Session

from common import jieba_cut, logger
from models import CreateAlgorithmRequest
from models.db.algorithm import AlgorithmCrud


def create_algorithm(request: CreateAlgorithmRequest, session: Session) -> int:
    """创建算法"""

    logger.info(f"create algorithm: {request}")
    d = {
        "name": request.name,
        "version": request.version,
        "description": request.description,
    }

    algorithm = AlgorithmCrud.create(session=session, algo=d)
    return algorithm.id


def get_by_page(session, page_size: int = 10, page_num: int = 1) -> list[dict]:
    return list(
        x.to_dict()
        for x in AlgorithmCrud.list(session, (page_num - 1) * page_size, page_size)
    )


def count(session) -> int:
    return AlgorithmCrud.count(session=session)


async def get_wordcloud(session) -> list[str]:
    objs = AlgorithmCrud.fetch_all(session)
    strs = ";".join([x.description for x in objs if x.description])
    return jieba_cut(strs)
