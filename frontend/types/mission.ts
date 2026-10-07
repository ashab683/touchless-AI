export type MissionDuration = 5 | 10 | 15 | 30 | 60;
export type MissionDifficulty = "easy" | "normal" | "adventurous";

export interface MissionRequest {
  duration: number;
  environment: string;
  goal: string;
  difficulty: MissionDifficulty;
}

export interface MissionResponse {
  id: string;
  title: string;
  duration: number;
  environment: string;
  goal: string;
  difficulty: string;
  instructions: string[];
  challenge: string;
  phone_rule: string;
  safety: string;
  created_at: string;
}

export interface ReflectionRequest {
  mission_id?: string;
  mission_title: string;
  user_experience: string;
}

export interface ReflectionResponse {
  reflection: string;
}

export interface StoredMission extends MissionResponse {
  completed_at?: string;
  user_reflection?: string;
  ai_reflection?: string;
}
