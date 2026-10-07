from datetime import datetime, timezone
import uuid
from typing import List, Literal, Optional
from pydantic import BaseModel, Field


class MissionRequest(BaseModel):
    duration: int = Field(
        default=15,
        description="Duration in minutes (e.g. 5, 10, 15, 30, 60)",
        ge=3,
        le=180,
    )
    environment: str = Field(
        default="Anywhere",
        description="Environment such as Anywhere, Neighborhood, Park, Garden, Trail, Campus",
    )
    goal: str = Field(
        default="Observe Nature",
        description="User's goal/mood such as Explore, Relax, Exercise, Observe Nature, Be Creative, Clear My Head, Surprise Me",
    )
    difficulty: Literal["easy", "normal", "adventurous"] = Field(
        default="normal",
        description="Difficulty level of the mission",
    )


class GemmaMissionOutput(BaseModel):
    """Raw structured output expected from the Gemma model."""
    title: str = Field(..., description="Short evocative name (max 6-7 words)")
    duration: int = Field(..., description="Duration in minutes matching request")
    instructions: List[str] = Field(
        ...,
        min_length=2,
        max_length=6,
        description="Step by step instructions for the outdoor activity",
    )
    challenge: str = Field(
        ...,
        description="One specific constraint or bonus challenge (e.g., without headphones)",
    )
    phone_rule: str = Field(
        ...,
        description="Direct instruction on putting the phone away",
    )
    safety: str = Field(
        ...,
        description="One practical safety guideline for the activity",
    )


class MissionResponse(BaseModel):
    """Enriched mission response delivered to client with metadata."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    duration: int
    environment: str
    goal: str
    difficulty: str
    instructions: List[str]
    challenge: str
    phone_rule: str
    safety: str
    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )


class ReflectionRequest(BaseModel):
    mission_id: Optional[str] = None
    mission_title: str
    user_experience: str = Field(
        ...,
        min_length=2,
        description="What the user noticed or felt during the mission",
    )


class ReflectionResponse(BaseModel):
    reflection: str = Field(
        ...,
        description="Short, mindful AI reflection (2-3 sentences max) affirming the offline experience",
    )
