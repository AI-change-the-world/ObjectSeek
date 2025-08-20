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
from models import CreateAlgorithmRequest
from services.algorithm_service import count, create_algorithm, get_by_page

router = APIRouter(
    prefix="/algorithm",
    tags=["algorithm"],
)


@router.post("/create", response_model=ApiResponse)
async def create_algorithm_handler(
    request: CreateAlgorithmRequest, session: Session = Depends(get_session)
):
    return ApiResponse(data=create_algorithm(request, session))


@router.post("/list", response_model=ApiPageResponse)
async def list_algorithm_handler(
    req: PaginatedRequest,
    session: Session = Depends(get_session),
):
    li = get_by_page(session, req.page_size, req.page_num)
    logger.info(f"list algorithm: {len(li)}")
    resp = ListResponse(total=count(session), records=li)

    return ApiPageResponse(data=resp)
