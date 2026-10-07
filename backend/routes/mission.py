import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException

from models.mission import (
    MissionRequest,
    MissionResponse,
    ReflectionRequest,
    ReflectionResponse,
)
from services import BaseAIService, get_ai_service

router = APIRouter(prefix="/mission", tags=["Missions"])


@router.post(
    "/generate",
    response_model=MissionResponse,
    summary="Generate an outdoor mission using Gemma 3 via Ollama",
    response_description="Structured outdoor mission ready for offline experience",
)
async def generate_mission(
    request: MissionRequest,
    ai_service: BaseAIService = Depends(get_ai_service),
) -> MissionResponse:
    """
    Generate a personalized, screen-free outdoor activity based on the user's
    environment, available time, mood, and difficulty.
    """
    gemma_output = await ai_service.generate_mission(request)

    # Wrap into client-ready response with unique ID and timestamp
    mission = MissionResponse(
        id=str(uuid.uuid4()),
        title=gemma_output.title,
        duration=gemma_output.duration,
        environment=request.environment,
        goal=request.goal,
        difficulty=request.difficulty,
        instructions=gemma_output.instructions,
        challenge=gemma_output.challenge,
        phone_rule=gemma_output.phone_rule,
        safety=gemma_output.safety,
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    return mission


@router.post(
    "/reflect",
    response_model=ReflectionResponse,
    summary="Generate a mindful post-mission reflection using Gemma 3",
)
async def reflect_mission(
    request: ReflectionRequest,
    ai_service: BaseAIService = Depends(get_ai_service),
) -> ReflectionResponse:
    """
    Generate a brief, 2-3 sentence reflection acknowledging the user's
    time outside away from screens.
    """
    reflection_text = await ai_service.generate_reflection(
        mission_title=request.mission_title,
        user_experience=request.user_experience,
    )
    return ReflectionResponse(reflection=reflection_text)
