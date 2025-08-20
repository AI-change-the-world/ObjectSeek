from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from common import ApiResponse, get_session
from models import CreateAlgorithmRequest
from services import create_algorithm

router = APIRouter(
    prefix="/algorithm",
    tags=["algorithm"],
)


@router.post("/create", response_model=ApiResponse)
async def create_algorithm_handler(
    request: CreateAlgorithmRequest, session: Session = Depends(get_session)
):
    return ApiResponse(data=create_algorithm(request, session))
