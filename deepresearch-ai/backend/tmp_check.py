import sys
import os
import asyncio

# Add project root to path
backend_dir = r"d:\Research.io\deepresearch-ai\backend"
sys.path.append(backend_dir)
os.chdir(backend_dir)

print(f"Python Path: {sys.path}")
print(f"Current Directory: {os.getcwd()}")

try:
    import celery_worker
    print("✅ celery_worker.py import successful")
except Exception as e:
    print(f"❌ celery_worker.py import failed: {e}")

try:
    from app.agents.graph import run_graph
    print("✅ app.agents.graph import successful")
except Exception as e:
    print(f"❌ app.agents.graph import failed: {e}")

async def test_redis():
    try:
        import redis.asyncio as aioredis
        from app.config import get_settings
        settings = get_settings()
        print(f"Testing Redis at {settings.REDIS_URL}")
        r = aioredis.from_url(settings.REDIS_URL)
        await r.ping()
        print("✅ Redis connection successful")
        await r.close()
    except Exception as e:
        print(f"❌ Redis connection failed: {e}")

asyncio.run(test_redis())
