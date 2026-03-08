from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from app.config import get_settings
from app.database import init_db
from app.routers import users, webhooks, research

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    
    # Setup LangSmith tracing if enabled
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

# Routers
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(webhooks.router, prefix="/api/v1/webhooks", tags=["webhooks"])
app.include_router(research.router, prefix="/api/v1/research", tags=["research"])

@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(status_code=404, content={"detail": "Not found"})

@app.exception_handler(422)
async def unprocessable_entity_handler(request, exc):
    return JSONResponse(status_code=422, content={"detail": "Unprocessable Entity", "errors": str(exc)})

@app.exception_handler(500)
async def server_error_handler(request, exc):
    return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})

@app.get("/health")
async def health_check():
    return {"status": "ok", "version": "1.0.0"}
