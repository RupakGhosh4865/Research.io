from fastapi import Depends, HTTPException, Security, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.config import get_settings
from app.database import get_db
from app.models.user import User
from app.utils.auth import decode_access_token

security = HTTPBearer(auto_error=False)
settings = get_settings()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: AsyncSession = Depends(get_db),
    token: str | None = Query(None)
) -> User:
    token_val = None
    if credentials:
        token_val = credentials.credentials
    elif token:
        token_val = token
        
    if not token_val:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    payload = decode_access_token(token_val)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
        
    result = await db.execute(select(User).filter(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
        
    return user

async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: AsyncSession = Depends(get_db),
    token: str | None = Query(None)
) -> User | None:
    try:
        return await get_current_user(credentials, db, token)
    except:
        return None
