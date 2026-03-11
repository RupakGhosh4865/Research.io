import json
from datetime import datetime, timezone

async def publish_agent_event(session_id: str, agent_name: str, status: str, content: str, redis_client):
    event = {
        "type": "agent_update",
        "agent": agent_name,
        "status": status,
        "content": content,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await redis_client.publish(f"research:{session_id}:events", json.dumps(event))

async def publish_status_event(session_id: str, status: str, progress_pct: int, redis_client):
    event = {
        "type": "status_update",
        "status": status,
        "progress": progress_pct,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await redis_client.publish(f"research:{session_id}:events", json.dumps(event))

async def publish_completed_event(session_id: str, report_id: str, redis_client):
    event = {
        "type": "completed",
        "report_id": report_id,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await redis_client.publish(f"research:{session_id}:events", json.dumps(event))
    
async def publish_error_event(session_id: str, error_message: str, redis_client):
    event = {
        "type": "error",
        "error": error_message,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    await redis_client.publish(f"research:{session_id}:events", json.dumps(event))
