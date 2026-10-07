import json
import re
import logging
from typing import Tuple
import httpx
from fastapi import HTTPException, status

from config import settings
from models.mission import MissionRequest, GemmaMissionOutput
from prompts.mission import (
    SYSTEM_MISSION_PROMPT,
    SYSTEM_REFLECTION_PROMPT,
    build_mission_prompt,
    build_reflection_prompt,
)
from services.base import BaseAIService

logger = logging.getLogger("touchless.ollama")


class OllamaService(BaseAIService):
    """Ollama AI service implementation running Google Gemma locally."""

    def __init__(self, base_url: str = None, model: str = None):
        self.base_url = (base_url or settings.ollama_base_url).rstrip("/")
        self.model = model or settings.ollama_model
        # Ollama local inference on CPU/GPU may take a little time
        self.timeout = httpx.Timeout(connect=10.0, read=180.0, write=10.0, pool=10.0)

    async def check_health(self) -> Tuple[bool, str]:
        """Verify Ollama server is running and requested model is available."""
        url = f"{self.base_url}/api/tags"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(url)
                if res.status_code != 200:
                    return False, f"Ollama returned HTTP {res.status_code}"

                data = res.json()
                models = [m.get("name") for m in data.get("models", [])]
                
                # Check for exact match or prefix match (e.g. gemma3:4b vs gemma3:4b-latest)
                model_found = any(
                    self.model in m or m.startswith(self.model) for m in models
                )
                if not model_found:
                    return (
                        True,
                        f"Ollama reachable, but model '{self.model}' not found in installed models: {models}",
                    )
                return True, f"Ollama is healthy. Model '{self.model}' is ready."
        except httpx.ConnectError:
            return (
                False,
                f"Cannot connect to Ollama at {self.base_url}. Make sure 'ollama serve' is running.",
            )
        except Exception as e:
            return False, f"Ollama health check failed: {str(e)}"

    def _extract_json_payload(self, raw_text: str) -> dict:
        """Robustly extract and parse JSON from the model output."""
        cleaned = raw_text.strip()
        # Remove markdown code fences if present
        if cleaned.startswith("```json"):
            cleaned = cleaned[len("```json"):].strip()
        elif cleaned.startswith("```"):
            cleaned = cleaned[len("```"):].strip()
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3].strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            # Fallback: regex search for the first outermost JSON object
            match = re.search(r"\{.*\}", cleaned, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(0))
                except json.JSONDecodeError as inner_err:
                    logger.error(f"Fallback JSON regex match failed to parse: {inner_err}")
            raise ValueError(f"Could not parse valid JSON from model response: {raw_text}")

    async def generate_mission(self, req: MissionRequest) -> GemmaMissionOutput:
        """Generate outdoor mission via Gemma and validate against Pydantic schema."""
        prompt = build_mission_prompt(req)
        url = f"{self.base_url}/api/generate"

        payload = {
            "model": self.model,
            "system": SYSTEM_MISSION_PROMPT,
            "prompt": prompt,
            "format": "json",
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload)
        except httpx.ConnectError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=(
                    f"Ollama server is not running or unreachable at {self.base_url}. "
                    f"Please run 'ollama serve' and ensure model '{self.model}' is installed."
                ),
            )
        except httpx.TimeoutException:
            raise HTTPException(
                status_code=status.HTTP_504_GATEWAY_TIMEOUT,
                detail=f"Ollama timed out while generating mission with model '{self.model}'.",
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Network error contacting Ollama: {str(e)}",
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Ollama returned HTTP error {response.status_code}: {response.text}",
            )

        res_data = response.json()
        raw_text = res_data.get("response", "").strip()

        if not raw_text:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Ollama returned an empty response.",
            )

        try:
            parsed_dict = self._extract_json_payload(raw_text)
            validated = GemmaMissionOutput.model_validate(parsed_dict)
            return validated
        except Exception as val_err:
            logger.error(f"Validation error on model output: {val_err}. Raw output was:\n{raw_text}")
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Gemma output did not match expected mission schema: {str(val_err)}",
            )

    async def generate_reflection(
        self, mission_title: str, user_experience: str
    ) -> str:
        """Generate a short mindful reflection using Gemma."""
        prompt = build_reflection_prompt(mission_title, user_experience)
        url = f"{self.base_url}/api/generate"

        payload = {
            "model": self.model,
            "system": SYSTEM_REFLECTION_PROMPT,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.6,
            },
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=payload)
        except httpx.ConnectError:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Ollama is unreachable at {self.base_url}.",
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error contacting Ollama: {str(e)}",
            )

        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Ollama returned error: {response.text}",
            )

        res_data = response.json()
        reflection_text = res_data.get("response", "").strip()
        # Clean any surrounding quotes
        if reflection_text.startswith('"') and reflection_text.endswith('"'):
            reflection_text = reflection_text[1:-1].strip()

        return reflection_text


# Default singleton instance
default_ai_service: BaseAIService = OllamaService()


def get_ai_service() -> BaseAIService:
    """Dependency injector so AI provider can be swapped cleanly."""
    return default_ai_service
