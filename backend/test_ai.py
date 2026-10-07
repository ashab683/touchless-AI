import asyncio
import sys
from models.mission import MissionRequest
from services.ollama import OllamaService

async def main():
    print("Testing Ollama connection...", flush=True)
    service = OllamaService()
    health, msg = await service.check_health()
    print(f"Health check: {health} - {msg}", flush=True)
    if not health:
        print("Health check failed, exiting.", flush=True)
        sys.exit(1)

    req = MissionRequest(
        duration=15,
        environment="Park",
        goal="Observe Nature",
        difficulty="normal"
    )
    print("Sending mission generation request to Gemma 3 via Ollama...", flush=True)
    mission = await service.generate_mission(req)
    print("\n--- MISSION GENERATION SUCCEEDED ---", flush=True)
    print(f"Title: {mission.title}", flush=True)
    print(f"Duration: {mission.duration} mins", flush=True)
    print(f"Instructions: {mission.instructions}", flush=True)
    print(f"Challenge: {mission.challenge}", flush=True)
    print(f"Phone Rule: {mission.phone_rule}", flush=True)
    print(f"Safety: {mission.safety}", flush=True)

if __name__ == "__main__":
    asyncio.run(main())
