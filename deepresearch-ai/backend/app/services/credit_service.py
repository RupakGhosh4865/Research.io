from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid
from app.models.user import User
from app.models.research import CreditTransaction

async def check_and_deduct_credit(user_id: uuid.UUID, session_id: uuid.UUID | None, db: AsyncSession):
    result = await db.execute(
        select(User).with_for_update().filter(User.id == user_id)
    )
    user = result.scalars().first()
    if not user or user.credits_remaining <= 0:
        raise HTTPException(status_code=402, detail="Insufficient credits")
        
    user.credits_remaining -= 1
    
    tx = CreditTransaction(
        user_id=user_id,
        amount=-1,
        type="report_used",
        research_session_id=session_id
    )
    db.add(tx)
    await db.commit()

async def add_credits(user_id: uuid.UUID, amount: int, tx_type: str, db: AsyncSession):
    result = await db.execute(
        select(User).with_for_update().filter(User.id == user_id)
    )
    user = result.scalars().first()
    if user:
        user.credits_remaining += amount
        tx = CreditTransaction(
            user_id=user_id,
            amount=amount,
            type=tx_type
        )
        db.add(tx)
        await db.commit()

async def get_credit_balance(user_id: uuid.UUID, db: AsyncSession):
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    return user.credits_remaining if user else 0
