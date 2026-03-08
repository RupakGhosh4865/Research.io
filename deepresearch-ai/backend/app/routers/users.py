from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.middleware.auth import get_current_user
from app.models.user import User
from app.models.research import CreditTransaction, ResearchSession

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

@router.get("/me/history")
async def get_my_history(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ResearchSession)
        .filter(ResearchSession.user_id == user.id)
        .order_by(ResearchSession.created_at.desc())
    )
    sessions = result.scalars().all()
    return sessions
