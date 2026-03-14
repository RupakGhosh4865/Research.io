from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import get_settings
import urllib.parse

settings = get_settings()

import asyncio

# Global storage for loop-specific engines/sessionmakers
_loop_engines = {}
_loop_sessionmakers = {}

def get_async_sessionmaker():
    """Returns a loop-specific sessionmaker to prevent 'attached to a different loop' errors."""
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.get_event_loop()
        
    if loop not in _loop_sessionmakers:
        # SQLAlchemy async engine requires asyncpg driver
        raw_url = settings.DATABASE_URL
        # Strip query parameters for asyncpg compatibility
        import urllib.parse
        parts = urllib.parse.urlparse(raw_url)
        clean_url = urllib.parse.urlunparse(parts._replace(query=""))
        
        db_url = clean_url.replace("postgresql://", "postgresql+asyncpg://", 1)
        
        engine = create_async_engine(
            db_url, 
            echo=False,
            pool_size=10, 
            max_overflow=20,
            pool_pre_ping=True,
            pool_recycle=3600,
            connect_args={"ssl": "require"} if "neon.tech" in db_url else {}
        )
        _loop_engines[loop] = engine
        _loop_sessionmakers[loop] = sessionmaker(
            engine, class_=AsyncSession, expire_on_commit=False
        )
        
        # Cleanup when loop closes (optional but good practice)
        # Note: In Celery with asyncio.run, loops are created/destroyed per task.
    
    return _loop_sessionmakers[loop]

def get_async_engine():
    """Returns a loop-specific engine."""
    get_async_sessionmaker() # Ensure engine is created for this loop
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.get_event_loop()
    return _loop_engines.get(loop)

# For legacy/standard FastAPI use (FastAPI usually runs in a single loop)
class AsyncSessionLocalProxy:
    def __call__(self):
        sm = get_async_sessionmaker()
        return sm()

AsyncSessionLocal = AsyncSessionLocalProxy()

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    engine = get_async_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
