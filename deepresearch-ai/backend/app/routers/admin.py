from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.database import get_db
from app.middleware.auth import get_admin_user
from app.models.user import User, PlanType
from app.models.research import ResearchSession, Report

router = APIRouter()

@router.get("/stats")
async def get_admin_stats(admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    # Total Users
    users_res = await db.execute(select(func.count(User.id)))
    total_users = users_res.scalar() or 0
    
    # Plans Breakdown
    plans_res = await db.execute(select(User.plan, func.count(User.id)).group_by(User.plan))
    plans_breakdown = {plan.name: count for plan, count in plans_res.all()}
    
    # Total Research Papers
    papers_res = await db.execute(select(func.count(Report.id)))
    total_papers = papers_res.scalar() or 0
    
    # Credits Stats
    credits_res = await db.execute(select(func.sum(User.credits_remaining)))
    total_credits_available = credits_res.scalar() or 0
    
    return {
        "total_users": total_users,
        "plans_breakdown": plans_breakdown,
        "total_papers": total_papers,
        "total_credits_available": total_credits_available
    }

@router.get("/users")
async def get_all_users(admin: User = Depends(get_admin_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [{
        "id": str(u.id),
        "email": u.email,
        "plan": u.plan,
        "credits": u.credits_remaining,
        "is_admin": u.is_admin,
        "created_at": u.created_at
    } for u in users]
