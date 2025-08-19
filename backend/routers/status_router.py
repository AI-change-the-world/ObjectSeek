from fastapi import APIRouter
from common.resp import ApiResponse
from models import SystemInfo
from services import SystemMonitor

router = APIRouter(
    prefix="/system-monitor",
    tags=["system-monitor"],
)


@router.get("/system/info", response_model=SystemInfo)
def system_info():
    return ApiResponse(data=SystemMonitor.get_system_info()) 
