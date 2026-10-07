"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Smile,
  ShieldAlert,
  PhoneOff,
  CheckCircle2,
  Sparkles,
  Eye,
  RefreshCw,
  Send,
  Home,
  History,
} from "lucide-react";
import { getStoredMissions, updateMissionReflection } from "@/lib/storage";
import { reflectMission } from "@/lib/api";
import { StoredMission } from "@/types/mission";

function MissionDetailContent() {
  const params = useParams();
  const missionId = (params?.id as string) || "";
  const router = useRouter();

  const [mission, setMission] = useState<StoredMission | null>(null);
  const [loading, setLoading] = useState(true);

  // Phone-Away Mode state
  const [phoneAway, setPhoneAway] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Reflection Flow state
  const [showReflectionForm, setShowReflectionForm] = useState(false);
  const [userReflection, setUserReflection] = useState("");
  const [submittingReflection, setSubmittingReflection] = useState(false);
  const [reflectionError, setReflectionError] = useState<string | null>(null);
  const [completedRecord, setCompletedRecord] = useState<StoredMission | null>(null);

  // Load mission from localStorage
  useEffect(() => {
    if (!missionId) return;
    const missions = getStoredMissions();
    const found = missions.find((m) => m.id === missionId);
    if (found) {
      setMission(found);
      if (found.completed_at) {
        setCompletedRecord(found);
      }
    }
    setLoading(false);
  }, [missionId]);

  // Elapsed time counter while in Phone-Away Mode
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phoneAway) {
      timer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phoneAway]);

  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartPhoneAway = () => {
    setPhoneAway(true);
  };

  const handleExitPhoneAway = () => {
    setPhoneAway(false);
  };

  const handleOpenReflection = () => {
    setPhoneAway(false);
    setShowReflectionForm(true);
  };

  const handleReflectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mission || !userReflection.trim()) return;

    setSubmittingReflection(true);
    setReflectionError(null);

    try {
      const res = await reflectMission({
        mission_id: mission.id,
        mission_title: mission.title,
        user_experience: userReflection.trim(),
      });

      // Save reflection to localStorage
      const updated = updateMissionReflection(
        mission.id,
        userReflection.trim(),
        res.reflection
      );

      setCompletedRecord(updated);
      setShowReflectionForm(false);
    } catch (err: any) {
      console.error(err);
      setReflectionError(
        err.message || "Could not generate reflection from Gemma. Please try again."
      );
    } finally {
      setSubmittingReflection(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground animate-pulse">
        Loading mission...
      </div>
    );
  }

  if (!mission) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-base text-muted-foreground">Mission not found in local storage.</p>
        <Link
          href="/mission/setup"
          className="inline-flex py-2 px-4 rounded-xl bg-emerald-700 text-white text-sm font-semibold"
        >
          Create a New Mission
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* ======================================================== */}
      {/* 4. IMMERSIVE PHONE-AWAY MODE (High Priority Core Feature) */}
      {/* ======================================================== */}
      {phoneAway && (
        <div className="fixed inset-0 z-50 bg-[radial-gradient(ellipse_at_center,_#0b1a10_0%,_#050c07_60%,_#020503_100%)] text-emerald-100 flex flex-col justify-between items-center p-6 sm:p-10 select-none">
          {/* Top Subtle Status */}
          <div className="w-full max-w-md flex items-center justify-center text-[11px] text-emerald-400/60 font-semibold tracking-widest uppercase pt-2">
            <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Phone-Away Active • Screen at Rest
            </span>
          </div>

          {/* Central Calming Affirmation & Luminous Orb */}
          <div className="flex flex-col items-center text-center space-y-6 max-w-sm my-auto">
            {/* Ambient breathing circle */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-44 h-44 rounded-full bg-emerald-500/10 blur-xl animate-breathe" />
              <div className="w-32 h-32 rounded-full bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center shadow-2xl shadow-emerald-950 animate-breathe">
                <span className="text-4xl drop-shadow-md">🌿</span>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-50">
                You&rsquo;re supposed to be outside.
              </h2>
              <p className="text-xs sm:text-sm text-emerald-400/80 leading-relaxed max-w-xs mx-auto">
                Put your phone in your pocket or backpack.
                <br />
                Notice the trees, the ground, the air, and the sounds.
              </p>
            </div>

            {/* Time spent outside */}
            <div className="p-3.5 px-7 rounded-2xl bg-emerald-950/60 border border-emerald-500/20 backdrop-blur-xs">
              <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-400/70 block">
                Time Disconnected
              </span>
              <span className="text-3xl font-mono font-bold text-emerald-200">
                {formatElapsed(elapsedSeconds)}
              </span>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="w-full max-w-sm space-y-3 pb-2">
            <button
              onClick={handleOpenReflection}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xl shadow-black/50 transition-all cursor-pointer active:scale-[0.99]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I&rsquo;ve Returned — Record Experience</span>
            </button>

            {/* Visually secondary: discouraged peek option */}
            <div className="text-center pt-1">
              <button
                onClick={handleExitPhoneAway}
                className="text-[11px] text-emerald-500/40 hover:text-emerald-300 underline underline-offset-4 transition-colors cursor-pointer"
              >
                Need a quick reminder? Peek at mission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. ACTIVE MISSION DISPLAY & REFLECTION SUMMARY */}
      {/* ======================================================== */}
      <div className="w-full max-w-xl mx-auto space-y-6">
        {/* Navigation & Status */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium">
              {mission.duration} mins
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/5 text-muted-foreground font-medium">
              {mission.environment}
            </span>
          </div>
        </div>

        {/* Mission Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#131d16] border border-black/5 dark:border-white/5 shadow-sm space-y-6">
          {/* Header */}
          <div className="space-y-1.5 border-b border-black/5 dark:border-white/5 pb-4">
            <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-700 dark:text-emerald-400">
              Outdoor Mission
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-950 dark:text-emerald-50">
              {mission.title}
            </h1>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
              Instructions
            </h3>
            <ol className="space-y-2.5">
              {mission.instructions.map((step, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-sm sm:text-base text-emerald-950 dark:text-emerald-100"
                >
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Bonus Challenge */}
          {mission.challenge && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs sm:text-sm text-amber-950 dark:text-amber-200 space-y-1">
              <span className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-400">
                🎯 Bonus Constraint
              </span>
              <p className="leading-relaxed">{mission.challenge}</p>
            </div>
          )}

          {/* Phone Rule Box */}
          <div className="p-4 rounded-2xl bg-emerald-600/10 border border-emerald-600/20 text-xs sm:text-sm text-emerald-950 dark:text-emerald-100 flex items-start gap-3">
            <PhoneOff className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-emerald-800 dark:text-emerald-300">
                Phone Rule
              </span>
              <p className="leading-relaxed">{mission.phone_rule}</p>
            </div>
          </div>

          {/* Safety Reminder */}
          {mission.safety && (
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
              <ShieldAlert className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Safety: {mission.safety}</span>
            </div>
          )}

          {/* Primary Action Buttons */}
          {!completedRecord && (
            <div className="pt-2 space-y-2.5">
              <button
                onClick={handleStartPhoneAway}
                className="w-full py-4 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base flex items-center justify-center gap-2 shadow-md shadow-emerald-900/15 transition-all cursor-pointer"
              >
                <PhoneOff className="w-5 h-5" />
                <span>Enter Phone-Away Mode</span>
              </button>

              <button
                onClick={() => setShowReflectionForm(true)}
                className="w-full py-3 px-6 rounded-2xl border border-emerald-900/10 dark:border-emerald-200/10 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>I&rsquo;ve Finished the Mission</span>
              </button>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 5. REFLECTION SECTION (Form & Completed Reflection View) */}
        {/* ======================================================== */}
        {showReflectionForm && !completedRecord && (
          <div className="p-6 rounded-3xl bg-white dark:bg-[#131d16] border border-black/5 dark:border-white/5 space-y-4">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-emerald-950 dark:text-emerald-50 flex items-center gap-2">
                <span>🌿</span>
                <span>Welcome back from outside</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                How was your experience? Share a short sentence on what you saw, felt, or heard.
              </p>
            </div>

            {reflectionError && (
              <p className="text-xs text-red-600 dark:text-red-400">{reflectionError}</p>
            )}

            <form onSubmit={handleReflectionSubmit} className="space-y-3">
              <textarea
                value={userReflection}
                onChange={(e) => setUserReflection(e.target.value)}
                placeholder="e.g., I heard birds I usually drown out with music, and the air was crisp..."
                rows={3}
                required
                className="w-full p-3.5 rounded-2xl border border-black/10 dark:border-white/10 bg-transparent text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 resize-none"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReflectionForm(false)}
                  className="px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReflection || !userReflection.trim()}
                  className="py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  {submittingReflection ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      <span>Reflecting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Complete Mission</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Completed Mission Reflection Display */}
        {completedRecord && (
          <div className="p-6 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Mission Complete
              </span>
              <span className="text-[11px] text-muted-foreground">
                {new Date(completedRecord.completed_at || "").toLocaleDateString()}
              </span>
            </div>

            {completedRecord.user_reflection && (
              <div className="space-y-1 text-xs sm:text-sm">
                <span className="font-semibold text-emerald-950 dark:text-emerald-100">
                  Your Observation:
                </span>
                <p className="italic text-muted-foreground bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-black/5 dark:border-white/5">
                  &ldquo;{completedRecord.user_reflection}&rdquo;
                </p>
              </div>
            )}

            {completedRecord.ai_reflection && (
              <div className="space-y-1 text-xs sm:text-sm">
                <span className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Gemma 3 Reflection:
                </span>
                <p className="text-emerald-950 dark:text-emerald-100 leading-relaxed font-serif">
                  {completedRecord.ai_reflection}
                </p>
              </div>
            )}

            <div className="pt-2 flex items-center gap-2">
              <Link
                href="/history"
                className="flex-1 py-2.5 px-4 rounded-xl border border-emerald-700/20 hover:bg-emerald-700/10 text-emerald-900 dark:text-emerald-200 text-xs font-semibold text-center transition-colors"
              >
                View History
              </Link>
              <Link
                href="/mission/setup"
                className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold text-center transition-colors shadow-xs"
              >
                Start Next Mission
              </Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function MissionDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-muted-foreground animate-pulse">
          Loading mission...
        </div>
      }
    >
      <MissionDetailContent />
    </Suspense>
  );
}
