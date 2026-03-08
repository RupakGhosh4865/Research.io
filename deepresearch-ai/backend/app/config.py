from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional

class Settings(BaseSettings):
    OPENAI_API_KEY: str
    LANGCHAIN_API_KEY: Optional[str] = None
    LANGCHAIN_PROJECT: str = "deepresearch-ai"
    LANGCHAIN_TRACING_V2: str = "true"
    
    TAVILY_API_KEY: str
    
    PINECONE_API_KEY: str
    PINECONE_INDEX_NAME: str
    PINECONE_ENVIRONMENT: str
    
    DATABASE_URL: str
    REDIS_URL: str
    
    CLERK_SECRET_KEY: str
    CLERK_PUBLISHABLE_KEY: str
    
    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_SECRET: str
    
    APP_ENV: str = "development"
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    SECRET_KEY: str
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

@lru_cache()
def get_settings():
    return Settings()
