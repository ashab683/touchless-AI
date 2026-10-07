import { StoredMission, MissionResponse } from "@/types/mission";

const STORAGE_KEY = "touchless_missions";

export function getStoredMissions(): StoredMission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read missions from localStorage:", err);
    return [];
  }
}

export function saveMission(mission: MissionResponse): StoredMission {
  const current = getStoredMissions();
  const stored: StoredMission = {
    ...mission,
    completed_at: undefined,
  };
  // Avoid duplicate by id
  const existingIdx = current.findIndex((m) => m.id === mission.id);
  if (existingIdx >= 0) {
    current[existingIdx] = stored;
  } else {
    current.unshift(stored);
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error("Failed to save mission to localStorage:", err);
  }
  return stored;
}

export function updateMissionReflection(
  missionId: string,
  userReflection: string,
  aiReflection: string
): StoredMission | null {
  const current = getStoredMissions();
  const idx = current.findIndex((m) => m.id === missionId);
  if (idx < 0) return null;

  current[idx].user_reflection = userReflection;
  current[idx].ai_reflection = aiReflection;
  current[idx].completed_at = new Date().toISOString();

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error("Failed to update mission in localStorage:", err);
  }
  return current[idx];
}

export function deleteMission(missionId: string): void {
  const current = getStoredMissions().filter((m) => m.id !== missionId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error("Failed to delete mission from localStorage:", err);
  }
}

export function clearAllMissions(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear missions from localStorage:", err);
  }
}

export function calculateStats(missions: StoredMission[]) {
  const completed = missions.filter((m) => m.completed_at);
  const totalCompleted = completed.length;
  const totalMinutes = completed.reduce((acc, m) => acc + (m.duration || 0), 0);

  // Favorite environment
  const envCounts: Record<string, number> = {};
  completed.forEach((m) => {
    envCounts[m.environment] = (envCounts[m.environment] || 0) + 1;
  });
  let favoriteEnv = "None yet";
  let maxCount = 0;
  for (const [env, count] of Object.entries(envCounts)) {
    if (count > maxCount) {
      maxCount = count;
      favoriteEnv = env;
    }
  }

  return {
    totalCompleted,
    totalMinutes,
    favoriteEnv,
  };
}
