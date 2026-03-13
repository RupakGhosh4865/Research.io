from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import get_settings
import urllib.parse

settings = get_settings()

# SQLAlchemy async engine requires asyncpg driver
raw_url = settings.DATABASE_URL
# Strip query parameters for asyncpg compatibility
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
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
