from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.research import CreditTransaction, ResearchSession, Report

router = APIRouter()

@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "email": user.email,
        "credits_remaining": user.credits_remaining,
        "plan": user.plan
    }

@router.get("/me/credits")
async def get_my_credits(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(CreditTransaction)
        .filter(CreditTransaction.user_id == user.id)
        .order_by(CreditTransaction.created_at.desc())
    )
    transactions = result.scalars().all()
    return transactions

@router.get("/me/stats")
async def get_me_stats(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Total reports
    reports_res = await db.execute(
        select(func.count(Report.id))
        .join(ResearchSession, Report.session_id == ResearchSession.id)
        .filter(ResearchSession.user_id == user.id)
    )
    total_reports = reports_res.scalar() or 0
    
    # Average quality score
    avg_score_res = await db.execute(
        select(func.avg(Report.quality_score))
        .join(ResearchSession, Report.session_id == ResearchSession.id)
        .filter(ResearchSession.user_id == user.id)
    )
    avg_quality_score = avg_score_res.scalar() or 0.0
    
    # Recent sessions
    sessions_res = await db.execute(
        select(ResearchSession)
        .filter(ResearchSession.user_id == user.id)
        .order_by(ResearchSession.created_at.desc())
        .limit(5)
    )
    recent_sessions = sessions_res.scalars().all()
    
    return {
        "credits_remaining": user.credits_remaining,
        "total_reports": total_reports,
        "avg_quality_score": round(float(avg_quality_score), 1),
        "recent_sessions": [{
            "id": str(s.id),
            "topic": s.topic,
            "status": s.status,
            "created_at": s.created_at
        } for s in recent_sessions]
    }

@router.get("/me/history")
async def get_my_history(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ResearchSession)
        .filter(ResearchSession.user_id == user.id)
        .order_by(ResearchSession.created_at.desc())
    )
    sessions = result.scalars().all()
    return sessions
