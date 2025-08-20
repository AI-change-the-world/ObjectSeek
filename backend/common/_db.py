from sqlalchemy import create_engine, make_url, text
from sqlalchemy.orm import sessionmaker

from common._config import settings
from common._logger import logger
from models.db import Base

engine = create_engine(
    settings.database_url,
    pool_size=10,
    max_overflow=20,
    pool_recycle=1800,
    pool_timeout=30,
    echo=settings.env == "dev",
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def create_database_if_not_exists(db_url: str):
    url = make_url(db_url)
    if url.drivername.startswith("mysql"):
        db_name = url.database
        tmp_url = url.set(database="mysql")
        logger.info(f"tmp_url: {tmp_url}")
        tmp_engine = create_engine(tmp_url)
        with tmp_engine.connect() as conn:
            conn.execute(
                text(
                    f"CREATE DATABASE IF NOT EXISTS `{db_name}` DEFAULT CHARACTER SET utf8mb4;"
                )
            )


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


def init_db():
    # 触发创建
    from models.db.algorithm import Algorithm
    from models.db.stream import Stream

    logger.info(f"init db, url: {engine.url}")
    create_database_if_not_exists(settings.database_url)
    Base.metadata.create_all(bind=engine)
    logger.info(
        f"注册的表：{Base.metadata.tables.keys()}",
    )
