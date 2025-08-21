from contextlib import asynccontextmanager

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from fastapi import APIRouter, Depends

from common import ApiResponse, get_session, get_sync_session, logger
from models.api.dashboard import Dashboard
from models.db.algorithm.algorithm_crud import AlgorithmCrud
from models.db.scenario.scenario_crud import ScenarioCrud
from services.dashboard_service import global_data, set_word_cloud, sync_refresh

# 调度器
scheduler = BackgroundScheduler()


@asynccontextmanager
async def lifespan(app):
    # Startup
    logger.info("启动应用...")
    await set_word_cloud(session=get_sync_session())

    scheduler.add_job(
        sync_refresh,
        args=[get_sync_session()],
        trigger=IntervalTrigger(hours=1),
        id="refresh_globals",
        misfire_grace_time=300,
    )
    scheduler.start()
    logger.info("定时任务启动")

    yield

    # Shutdown
    logger.info("关闭应用...")
    scheduler.shutdown()
    logger.info("定时任务停止")


router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
    lifespan=lifespan,
)


@router.get("", response_model=ApiResponse)
async def dashboard_handler(db=Depends(get_session)):
    return ApiResponse(
        data=Dashboard(
            # TODO
            total_video=0,
            total_scenario=ScenarioCrud.count(db),
            total_algorithm=AlgorithmCrud.count(db),
            scenario_wordcloud=global_data.get("scenario", default=[]),
            algorithm_wordcloud=global_data.get("algorithm", default=[]),
        )
    )
