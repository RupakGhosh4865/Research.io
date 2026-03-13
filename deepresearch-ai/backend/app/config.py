from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional

class Settings(BaseSettings):
    GROQ_API_KEY: str
    ADMIN_EMAIL: str = "rupak@research.io"  # Default admin
    LANGCHAIN_API_KEY: Optional[str] = None
    LANGCHAIN_PROJECT: str = "deepresearch-ai"
    LANGCHAIN_TRACING_V2: str = "true"
    
    TAVILY_API_KEY: str
    
    PINECONE_API_KEY: str
    PINECONE_INDEX_NAME: str
    PINECONE_ENVIRONMENT: str
    
    DATABASE_URL: str
    REDIS_URL: str
    
    APP_ENV: str = "development"
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    SECRET_KEY: str
    
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URL: str = "http://localhost:8002/api/v1/auth/google/callback"
    
    RAZORPAY_KEY_ID: Optional[str] = None
    RAZORPAY_KEY_SECRET: Optional[str] = None
    RAZORPAY_WEBHOOK_SECRET: Optional[str] = None
    
    # Prices in INR (Paise)
    RAZORPAY_TEST_AMOUNT: int = 100        # ₹1.00
    RAZORPAY_STARTER_AMOUNT: int = 19900   # ₹199.00
    RAZORPAY_PRO_AMOUNT: int = 49900       # ₹499.00
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

@lru_cache()
def get_settings():
    return Settings()
