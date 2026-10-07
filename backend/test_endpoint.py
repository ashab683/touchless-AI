import httpx
import json

payload = {
    "duration": 15,
    "environment": "Park",
    "goal": "Observe Nature",
    "difficulty": "normal"
}

print("Sending POST /api/mission/generate to FastAPI backend...")
with httpx.Client(timeout=180.0) as client:
    resp = client.post("http://127.0.0.1:8000/api/mission/generate", json=payload)
    print("HTTP Status:", resp.status_code)
    data = resp.json()
    print("Response JSON:")
    print(json.dumps(data, indent=2))
