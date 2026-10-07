from abc import ABC, abstractmethod
from typing import Tuple
from models.mission import MissionRequest, GemmaMissionOutput


class BaseAIService(ABC):
    """Abstract interface for TouchLess AI providers (Ollama, vLLM, etc.)."""

    @abstractmethod
    async def generate_mission(self, req: MissionRequest) -> GemmaMissionOutput:
        """Generate a structured outdoor mission matching the user's constraints."""
        pass

    @abstractmethod
    async def generate_reflection(
        self, mission_title: str, user_experience: str
    ) -> str:
        """Generate a short mindful reflection on the user's completed mission."""
        pass

    @abstractmethod
    async def check_health(self) -> Tuple[bool, str]:
        """Check if the AI provider and model are reachable and ready."""
        pass
