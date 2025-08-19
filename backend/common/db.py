from common.config import settings
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from common import logger

logger.info(f"初始化数据库连接 {settings.database_url}")
engine = create_engine(settings.database_url, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# 依赖注入
from contextlib import contextmanager


@contextmanager
def get_session():
    session = SessionLocal()
    try:
        yield session
        session.commit()
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()
