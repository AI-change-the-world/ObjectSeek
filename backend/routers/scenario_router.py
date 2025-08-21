from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from common import (
    ApiPageResponse,
    ApiResponse,
    ListResponse,
    PaginatedRequest,
    get_session,
    logger,
)
from models.api.scenario import CreateScenarioRequest, UpdateScenarioRequest
from services.scenario_service import (
    count,
    create_scenario,
    delete,
    get_by_page,
    update,
)

router = APIRouter(
    prefix="/scenario",
    tags=["scenario"],
)


@router.post("/create", response_model=ApiResponse)
async def create_scenario_handler(
    request: CreateScenarioRequest, session: Session = Depends(get_session)
) -> ApiResponse:
    """创建场景"""
    return ApiResponse(data=create_scenario(request, session))


@router.get("/delete/{id}", response_model=ApiResponse)
async def delete_scenario_handler(
    id: int, session: Session = Depends(get_session)
) -> ApiResponse:
    """删除场景"""
    return ApiResponse(data=delete(session, id))


@router.post("/update", response_model=ApiResponse)
async def update_scenario_handler(
    request: UpdateScenarioRequest, session: Session = Depends(get_session)
) -> ApiResponse:
    """更新场景"""
    return ApiResponse(data=update(session, request))


@router.post("/list", response_model=ApiPageResponse)
async def list_scenario_handler(
    req: PaginatedRequest,
    session: Session = Depends(get_session),
):
    li = get_by_page(session, req.page_size, req.page_num)
    logger.info(f"list algorithm: {len(li)}")
    resp = ListResponse(total=count(session), records=li)

    return ApiPageResponse(data=resp)
