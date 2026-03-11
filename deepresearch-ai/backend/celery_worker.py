import os
import sys
import asyncio
from celery import Celery
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")

celery_app = Celery("research_worker", broker=redis_url, backend=redis_url)

@celery_app.task(name="run_research_task")
def run_research_task(session_id: str, topic: str, thread_id: str, user_id: str, uploaded_doc_ids: list[str] = []):
    from app.agents.graph import run_graph
    import redis
    
    redis_client = redis.from_url(redis_url, decode_responses=True)
    try:
        loop = asyncio.get_event_loop()
        loop.run_until_complete(run_graph(session_id, topic, thread_id, uploaded_doc_ids))
    except Exception as e:
        print(f"Graph failed: {str(e)}")
        from app.utils.streaming import publish_error_event
        loop.run_until_complete(publish_error_event(session_id, str(e), redis_client))
