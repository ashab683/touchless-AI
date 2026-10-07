import {
  MissionRequest,
  MissionResponse,
  ReflectionRequest,
  ReflectionResponse,
} from "@/types/mission";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

export async function checkBackendHealth(): Promise<{
  status: string;
  ollama_ready: boolean;
  detail: string;
  model: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, {
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Backend health check failed with HTTP ${res.status}`);
    }
    return await res.json();
  } catch (err: any) {
    if (err.name === "TypeError" || err.message?.includes("fetch")) {
      throw new Error(
        "TouchLess AI backend is unreachable. Make sure the FastAPI server is running on http://localhost:8000 and Ollama is active."
      );
    }
    throw err;
  }
}

export async function generateMission(
  request: MissionRequest
): Promise<MissionResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/mission/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message =
        errorData.detail ||
        `Failed to generate mission (HTTP ${res.status}). Ensure Ollama is running and Gemma 3 is pulled.`;
      throw new Error(message);
    }

    return await res.json();
  } catch (err: any) {
    if (err.name === "TypeError" || err.message?.includes("fetch")) {
      throw new Error(
        "Could not connect to the TouchLess AI server. Please verify FastAPI (http://localhost:8000) and Ollama are running."
      );
    }
    throw err;
  }
}

export async function reflectMission(
  request: ReflectionRequest
): Promise<ReflectionResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/mission/reflect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      const message =
        errorData.detail ||
        `Failed to generate reflection (HTTP ${res.status}).`;
      throw new Error(message);
    }

    return await res.json();
  } catch (err: any) {
    if (err.name === "TypeError" || err.message?.includes("fetch")) {
      throw new Error(
        "Network connection to TouchLess AI backend lost. Please verify the backend is active."
      );
    }
    throw err;
  }
}
