from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from common import ApiResponse, PaginatedRequest, get_session, ApiPageResponse, ListResponse
from models.api.stream import CreateStreamRequest
from services import stream_service

router = APIRouter(
    prefix="/stream",
    tags=["stream"],
)


@router.get("/group", response_model=ApiResponse)
async def group(session: Session = Depends(get_session)):
    return ApiResponse(data=stream_service.group(session))


@router.post("/create", response_model=ApiResponse)
async def create_stream_handler(
    request: CreateStreamRequest, session: Session = Depends(get_session)
) -> ApiResponse:
    """创建场景"""
    return ApiResponse(data=stream_service.create_stream(request, session))


@router.post("/list-by-scenario/{type_id}", response_model=ApiPageResponse)
async def list_by_scenario_handler(
    request: PaginatedRequest, type_id: int, session: Session = Depends(get_session)
) -> ApiPageResponse:
    """获取场景下的数据流列表"""
    count = stream_service.count_by_scenario(session, type_id)
    return ApiPageResponse(
        data=ListResponse(total=count, records=stream_service.list_by_scenario(session, request, type_id))
    )
