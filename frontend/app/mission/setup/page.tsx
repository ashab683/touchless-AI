"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, AlertCircle, Compass, Clock, MapPin, Smile, Flame } from "lucide-react";
import { generateMission } from "@/lib/api";
import { saveMission } from "@/lib/storage";
import { MissionDuration, MissionDifficulty } from "@/types/mission";

const DURATIONS: { label: string; value: MissionDuration }[] = [
  { label: "5 min", value: 5 },
  { label: "10 min", value: 10 },
  { label: "15 min", value: 15 },
  { label: "30 min", value: 30 },
  { label: "60 min", value: 60 },
];

const ENVIRONMENTS = [
  "Anywhere",
  "Neighborhood",
  "Park",
  "Garden",
  "Trail",
  "Campus",
];

const MOODS = [
  "Explore",
  "Relax",
  "Exercise",
  "Observe Nature",
  "Be Creative",
  "Clear My Head",
  "Surprise Me",
];

const DIFFICULTIES: { label: string; value: MissionDifficulty; desc: string }[] = [
  { label: "Easy", value: "easy", desc: "Gentle stroll & observation" },
  { label: "Normal", value: "normal", desc: "Balanced physical & mindful task" },
  { label: "Adventurous", value: "adventurous", desc: "Active exploration & challenges" },
];

export default function MissionSetupPage() {
  const router = useRouter();

  const [duration, setDuration] = useState<MissionDuration>(15);
  const [environment, setEnvironment] = useState<string>("Park");
  const [goal, setGoal] = useState<string>("Observe Nature");
  const [difficulty, setDifficulty] = useState<MissionDifficulty>("normal");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const mission = await generateMission({
        duration,
        environment,
        goal,
        difficulty,
      });

      // Save to localStorage
      saveMission(mission);

      // Navigate to mission display
      router.push(`/mission/${mission.id}`);
    } catch (err: any) {
      console.error(err);
      setError(
        err.message ||
          "Could not generate mission. Make sure Ollama and the FastAPI backend are running."
      );
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 py-2">
      {/* Back button & Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50">
            Configure Your Mission
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Select your preferences, then get ready to step away from your screen.
          </p>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-900 dark:text-red-200 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Generation Failed</p>
            <p className="text-red-800/90 dark:text-red-300/90">{error}</p>
          </div>
        </div>
      )}

      {/* Setup Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Duration Selection */}
        <div className="space-y-2.5">
          <label className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-950 dark:text-emerald-200">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span>Available Time</span>
          </label>
          <div className="grid grid-cols-5 gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDuration(d.value)}
                className={`py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  duration === d.value
                    ? "bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600/30"
                    : "bg-white dark:bg-[#131d16] border border-black/5 dark:border-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-foreground"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Environment Selection */}
        <div className="space-y-2.5">
          <label className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-950 dark:text-emerald-200">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Environment</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {ENVIRONMENTS.map((env) => (
              <button
                key={env}
                type="button"
                onClick={() => setEnvironment(env)}
                className={`py-2 px-3.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  environment === env
                    ? "bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600/30"
                    : "bg-white dark:bg-[#131d16] border border-black/5 dark:border-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-foreground"
                }`}
              >
                {env}
              </button>
            ))}
          </div>
        </div>

        {/* Mood / Goal Selection */}
        <div className="space-y-2.5">
          <label className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-950 dark:text-emerald-200">
            <Smile className="w-4 h-4 text-emerald-600" />
            <span>Mood / Goal</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {MOODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setGoal(m)}
                className={`py-2 px-3.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  goal === m
                    ? "bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600/30"
                    : "bg-white dark:bg-[#131d16] border border-black/5 dark:border-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-2.5">
          <label className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-950 dark:text-emerald-200">
            <Flame className="w-4 h-4 text-emerald-600" />
            <span>Difficulty</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => setDifficulty(d.value)}
                className={`py-2.5 px-2 rounded-xl text-center transition-all ${
                  difficulty === d.value
                    ? "bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600/30"
                    : "bg-white dark:bg-[#131d16] border border-black/5 dark:border-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-foreground"
                }`}
              >
                <div className="text-xs sm:text-sm font-semibold">{d.label}</div>
                <div className="text-[10px] opacity-80 truncate">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button & Offline Notice */}
        <div className="pt-2 space-y-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-900/40 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/15 transition-all active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Gemma is designing your mission...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span>🌿</span>
                <span>Generate Mission</span>
              </div>
            )}
          </button>

          {loading && (
            <p className="text-center text-xs text-muted-foreground animate-pulse italic">
              Remember: As soon as you read your instructions, put your phone away.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
