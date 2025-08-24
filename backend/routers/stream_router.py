import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session
from sse_starlette.sse import EventSourceResponse

from common import (ApiPageResponse, ApiResponse, ListResponse,
                    PaginatedRequest, clear_expired_cache, get_cache_stats,
                    get_session, logger, presign_url, s3_operator)
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
        data=ListResponse(
            total=count,
            records=stream_service.list_by_scenario(session, request, type_id),
        )
    )


@router.get("/catalog", response_model=ApiResponse)
async def catalog(session: Session = Depends(get_session)) -> ApiResponse:
    """获取数据流目录"""
    return ApiResponse(data=stream_service.catalog(session))


@router.get("/analyze/{id}")
async def analyze(id: int, session: Session = Depends(get_session)):
    from ai.algo_1 import Algo_1

    obj = stream_service.get_by_id(session, id)
    if obj is None:
        return " [DONE] No such stream or file"
    al = Algo_1(video_path=obj.stream_path)
    return EventSourceResponse(al.run(), media_type="text/event-stream")


@router.get("/view/{id}", response_model=ApiResponse)
async def view_handler(id: int, session: Session = Depends(get_session)) -> ApiResponse:
    """查看数据流详情"""
    obj = stream_service.get_by_id(session, id)
    if not obj:
        return ApiResponse(message="数据不存在", code=500)
    if obj.stream_type == "file":
        p = await presign_url(obj.stream_path)
    else:
        p = obj.stream_path
    return ApiResponse(data=p)


@router.post("/upload", response_model=ApiResponse)
async def upload_file_handler(file: UploadFile = File(...)):
    """
    文件上传接口
    上传文件到本地 MinIO，文件名使用 UUID + 原始文件后缀
    成功返回文件名，失败返回 None
    """
    try:
        logger.info(f"开始上传文件: {file.filename}")

        # 获取文件后缀
        file_suffix = Path(file.filename).suffix if file.filename else ""

        # 生成新的文件名: UUID + 原始后缀
        new_filename = f"{uuid.uuid4()}{file_suffix}"

        # 读取文件内容
        file_content = await file.read()

        # 使用 OpenDAL 上传到 MinIO
        s3_operator.write(new_filename, file_content)

        logger.info(f"文件上传成功: {new_filename}")
        return ApiResponse(data=new_filename, message="文件上传成功", code=200)

    except Exception as e:
        logger.error(f"文件上传失败: {str(e)}")
        return ApiResponse(data=None, message=f"文件上传失败: {str(e)}", code=500)


@router.get("/cache/stats", response_model=ApiResponse)
async def get_cache_stats_handler() -> ApiResponse:
    """
    获取缓存统计信息
    """
    try:
        stats = get_cache_stats()
        return ApiResponse(data=stats, message="获取缓存统计成功", code=200)
    except Exception as e:
        logger.error(f"获取缓存统计失败: {str(e)}")
        return ApiResponse(data=None, message=f"获取缓存统计失败: {str(e)}", code=500)


@router.post("/cache/clear", response_model=ApiResponse)
async def clear_cache_handler() -> ApiResponse:
    """
    手动清理过期缓存
    """
    try:
        clear_expired_cache()
        stats = get_cache_stats()
        return ApiResponse(data=stats, message="清理过期缓存成功", code=200)
    except Exception as e:
        logger.error(f"清理缓存失败: {str(e)}")
        return ApiResponse(data=None, message=f"清理缓存失败: {str(e)}", code=500)
