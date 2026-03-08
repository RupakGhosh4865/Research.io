from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import urllib.request
import json
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.config import get_settings
from app.database import get_db
from app.models.user import User

security = HTTPBearer(auto_error=False)
settings = get_settings()

def get_clerk_jwks():
    url = "https://api.clerk.com/v1/jwks"
    response = urllib.request.urlopen(url)
    return json.loads(response.read().decode("utf-8"))

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    if not credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
        
    token = credentials.credentials
    try:
        jwks = get_clerk_jwks()
        unverified_header = jwt.get_unverified_header(token)
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
                break
        
        if rsa_key:
            payload = jwt.decode(
                token,
                rsa_key,
                algorithms=["RS256"],
                options={"verify_aud": False}
            )
            clerk_id = payload.get("sub")
            if clerk_id is None:
                raise HTTPException(status_code=401, detail="Invalid auth credentials")
                
            result = await db.execute(select(User).filter(User.clerk_id == clerk_id))
            user = result.scalars().first()
            if not user:
                raise HTTPException(status_code=401, detail="User not found in DB")
            return user
            
        raise HTTPException(status_code=401, detail="Invalid token kid")
    except JWTError as e:
        raise HTTPException(status_code=401, detail=f"JWT Decode error")
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication error: {str(e)}")

async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: AsyncSession = Depends(get_db)
) -> User | None:
    if not credentials:
        return None
    try:
        return await get_current_user(credentials, db)
    except:
        return None
