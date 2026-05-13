from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy import create_engine
import os

# Read directly from environment to avoid any config caching issues
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql+asyncpg://tradescope:tradescope@db:5432/tradescope"
)
SYNC_DATABASE_URL = os.environ.get(
    "SYNC_DATABASE_URL",
    "postgresql+psycopg2://tradescope:tradescope@db:5432/tradescope"
)

# Async engine — used by FastAPI
engine = create_async_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Sync engine — used by Alembic only
sync_engine = create_engine(SYNC_DATABASE_URL)


async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
