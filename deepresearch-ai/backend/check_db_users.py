import asyncio
from sqlalchemy import text
from app.database import AsyncSessionLocal

async def check_users():
    async with AsyncSessionLocal() as session:
        result = await session.execute(text("SELECT email, is_admin FROM users"))
        users = result.all()
        print("Users in database:")
        for u in users:
            print(f"- {u.email} (Admin: {u.is_admin})")

if __name__ == "__main__":
    asyncio.run(check_users())
