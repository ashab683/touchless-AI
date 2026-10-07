"""
TouchLess AI — FastAPI Backend
Hacktoberfest 2026: Week 1 — Touch Grass
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routes.mission import router as mission_router
from services import get_ai_service

app = FastAPI(
    title="TouchLess AI API",
    description="Minimalist API for outdoor missions designed to get users away from screens.",
    version="1.0.0",
)

# Enable CORS for local Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(mission_router, prefix="/api")


@app.get("/api/health", tags=["Health"])
async def health_check():
    """Health check endpoint that also probes Ollama and Gemma availability."""
    ai_service = get_ai_service()
    ollama_ok, detail = await ai_service.check_health()
    return {
        "status": "healthy" if ollama_ok else "degraded",
        "service": "touchless-ai-backend",
        "provider": "ollama",
        "model": settings.ollama_model,
        "ollama_ready": ollama_ok,
        "detail": detail,
    }
