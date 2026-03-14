from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel
import uuid
import json
import redis.asyncio as aioredis
import importlib

from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.research import ResearchSession, SessionStatus
from app.services.credit_service import check_and_deduct_credit
from app.config import get_settings

router = APIRouter()
settings = get_settings()

class StartResearchReq(BaseModel):
    topic: str
    uploaded_doc_ids: list[str] = []

@router.post("/start")
async def start_research(req: StartResearchReq, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    session = ResearchSession(
        user_id=user.id,
        topic=req.topic,
        status=SessionStatus.planning,
        langgraph_thread_id=str(uuid.uuid4())
    )
    db.add(session)
    await db.flush()
    
    await check_and_deduct_credit(user.id, session.id, db)
    
    session_id_str = str(session.id)
    thread_id = session.langgraph_thread_id
    await db.commit()
    
    try:
        celery_module = importlib.import_module("celery_worker")
        celery_module.run_research_task.delay(
    session_id_str,
    req.topic,
    thread_id,
    req.uploaded_doc_ids,
    str(user.id)
)
    except Exception as e:
        print("Error queuing celery task:", e)

    return {
        "session_id": session_id_str,
        "thread_id": thread_id,
        "status": "started"
    }

@router.get("/{session_id}/stream")
async def stream_research(session_id: str, user: User = Depends(get_current_user)):
    async def event_generator():
        redis_conn = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        pubsub = redis_conn.pubsub()
        channel = f"research:{session_id}:events"
        await pubsub.subscribe(channel)
        
        try:
            while True:
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=15.0)
                if message:
                    data = message['data']
                    yield f"data: {data}\n\n"
                    
                    try:
                        parsed = json.loads(data)
                        if parsed.get("type") in ["completed", "error"]:
                            break
                    except:
                        pass
                else:
                    yield f"data: {json.dumps({'type': 'heartbeat'})}\n\n"
        finally:
            await pubsub.unsubscribe(channel)
            await redis_conn.close()
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

class ApprovePlanReq(BaseModel):
    approved: bool
    feedback: str = ""

@router.post("/{session_id}/approve-plan")
async def approve_plan(session_id: str, req: ApprovePlanReq, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    session_uuid = uuid.UUID(session_id)
    result = await db.execute(select(ResearchSession).filter(ResearchSession.id == session_uuid))
    session = result.scalars().first()
    if not session or session.user_id != user.id:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if req.approved:
        session.plan_approved = True
        await db.commit()
        
        # Resume the research task
        try:
            celery_module = importlib.import_module("celery_worker")
            celery_module.run_research_task.delay(
                session_id,
                session.topic,
                session.langgraph_thread_id,
                [], 
                str(user.id)
            )
        except Exception as e:
            print("Error re-queuing celery task:", e)
            
        redis_conn = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
        await redis_conn.publish(f"research:{session_id}:control", json.dumps({"action": "resume", "feedback": req.feedback}))
        await redis_conn.close()
    else:
        session.status = SessionStatus.failed
        await db.commit()
    
    return {"status": "resumed" if req.approved else "cancelled"}

@router.get("/{session_id}/status")
async def get_session_status(session_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    session_uuid = uuid.UUID(session_id)
    result = await db.execute(select(ResearchSession).filter(ResearchSession.id == session_uuid))
    session = result.scalars().first()
    if not session or session.user_id != user.id:
        raise HTTPException(status_code=404, detail="Session not found")
        
    from app.models.research import Report
    report_res = await db.execute(select(Report.id).filter(Report.session_id == session_uuid))
    report_id = report_res.scalars().first()
        
    return {
        "status": session.status,
        "plan_approved": session.plan_approved,
        "report_id": str(report_id) if report_id else None
    }
