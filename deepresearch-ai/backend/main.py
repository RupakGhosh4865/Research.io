from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from app.config import get_settings
from app.database import init_db
from app.routers import users, webhooks, research, payments, reports, auth

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # await init_db()
    if getattr(settings, "LANGCHAIN_TRACING_V2", "false").lower() == "true":
        os.environ["LANGCHAIN_TRACING_V2"] = "true"
        os.environ["LANGCHAIN_API_KEY"] = settings.LANGCHAIN_API_KEY
        if settings.LANGCHAIN_PROJECT:
            os.environ["LANGCHAIN_PROJECT"] = settings.LANGCHAIN_PROJECT
    yield

app = FastAPI(lifespan=lifespan, title="DeepResearch AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(webhooks.router, prefix="/api/v1/webhooks", tags=["webhooks"])
app.include_router(research.router, prefix="/api/v1/research", tags=["research"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["payments"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])

@app.get("/")
async def root():
    return {"message": "Welcome to DeepResearch AI API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}
