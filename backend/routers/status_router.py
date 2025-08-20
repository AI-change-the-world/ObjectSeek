from fastapi import APIRouter

from common import ApiResponse
from services import SystemMonitor

router = APIRouter(
    prefix="/system-monitor",
    tags=["system-monitor"],
)


@router.get("/system/info", response_model=ApiResponse)
def system_info():
    return ApiResponse(data=SystemMonitor.get_system_info())
