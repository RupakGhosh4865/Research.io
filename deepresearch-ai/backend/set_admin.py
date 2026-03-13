import asyncio
from sqlalchemy import text
from app.database import AsyncSessionLocal
from app.config import get_settings

async def make_admin():
    settings = get_settings()
    async with AsyncSessionLocal() as session:
        # First, ensure the is_admin column exists (for safety)
        try:
            await session.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE"))
            await session.commit()
            print("Successfully added is_admin column (if it didn't exist).")
        except Exception as e:
            print(f"Column check/add failed (maybe already exists): {e}")

        # Now, set the admin
        result = await session.execute(
            text("UPDATE users SET is_admin = TRUE WHERE email = :email"),
            {"email": settings.ADMIN_EMAIL}
        )
        await session.commit()
        if result.rowcount > 0:
            print(f"DONE: User {settings.ADMIN_EMAIL} is now an ADMIN.")
        else:
            print(f"WARNING: User {settings.ADMIN_EMAIL} not found in database. They will become admin upon next signup.")

if __name__ == "__main__":
    asyncio.run(make_admin())
