from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import (
    algorithm_router,
    dashboard_router,
    scenario_router,
    status_router,
    stream_router,
)
from common._background_tasks import start_cache_cleanup

app = FastAPI()

# 启动缓存清理后台任务
start_cache_cleanup()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许访问的前端地址列表
    allow_credentials=True,  # 是否允许携带 cookie
    allow_methods=["*"],  # 允许的请求方法
    allow_headers=["*"],  # 允许的请求头
)

app.include_router(status_router)
app.include_router(algorithm_router)
app.include_router(scenario_router)
app.include_router(dashboard_router)
app.include_router(stream_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=14300, reload=True)
