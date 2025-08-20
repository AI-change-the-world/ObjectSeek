from typing import Optional

from sqlalchemy.orm import Session

from common import logger
from models.api.scenario import CreateScenarioRequest, UpdateScenarioRequest
from models.db.scenario import Scenario, ScenarioCrud


def create_scenario(req: CreateScenarioRequest, session: Session) -> int:
    d = {"name": req.name, "description": req.description}
    scenario = ScenarioCrud.create(session, d)
    return scenario.id


def get_by_page(session, page_size: int = 10, page_num: int = 1) -> list[dict]:
    return list(
        x.to_dict()
        for x in ScenarioCrud.list(session, (page_num - 1) * page_size, page_size)
    )


def count(session) -> int:
    return ScenarioCrud.count(session)


def delete(session, id: int) -> bool:
    return ScenarioCrud.soft_delete(session, id)


def update(session, req: UpdateScenarioRequest) -> Optional[int]:
    d = {"name": req.name, "description": req.description}
    scenario = ScenarioCrud.update(session, req.id, d)
    return scenario.id if scenario else None
