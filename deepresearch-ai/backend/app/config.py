from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional

class Settings(BaseSettings):
    GROQ_API_KEY: str
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
    GOOGLE_REDIRECT_URL: str = "http://localhost:8001/api/v1/auth/google/callback"
    
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    
    # Prices (Placeholders for Stripe Price IDs)
    STRIPE_STARTER_PRICE_ID: str = "price_starter"
    STRIPE_PRO_PRICE_ID: str = "price_pro"
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

@lru_cache()
def get_settings():
    return Settings()
