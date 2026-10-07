"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Compass, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Moon, Trees, PhoneOff } from "lucide-react";
import { getStoredMissions, calculateStats } from "@/lib/storage";
import { checkBackendHealth } from "@/lib/api";

export default function HomePage() {
  const [stats, setStats] = useState<{ totalCompleted: number; totalMinutes: number; favoriteEnv: string }>({
    totalCompleted: 0,
    totalMinutes: 0,
    favoriteEnv: "None yet",
  });
  const [backendStatus, setBackendStatus] = useState<{
    loaded: boolean;
    ready: boolean;
    model: string;
    detail: string;
  }>({
    loaded: false,
    ready: false,
    model: "gemma3:4b",
    detail: "Checking AI connection...",
  });

  useEffect(() => {
    // Read stats from localStorage
    const missions = getStoredMissions();
    setStats(calculateStats(missions));

    // Probe backend health
    checkBackendHealth()
      .then((data) => {
        setBackendStatus({
          loaded: true,
          ready: data.ollama_ready,
          model: data.model || "gemma3:4b",
          detail: data.detail,
        });
      })
      .catch((err) => {
        setBackendStatus({
          loaded: true,
          ready: false,
          model: "gemma3:4b",
          detail: "Backend unreachable. Ensure FastAPI and Ollama are running.",
        });
      });
  }, []);

  return (
    <div className="flex flex-col items-center text-center space-y-8 my-auto py-4">
      {/* AI Backend Health Status Badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300">
        <span
          className={`w-2 h-2 rounded-full ${
            backendStatus.loaded
              ? backendStatus.ready
                ? "bg-emerald-500 animate-pulse"
                : "bg-amber-500"
              : "bg-gray-400"
          }`}
        />
        <span>
          {backendStatus.loaded
            ? backendStatus.ready
              ? `Gemma 3 Active (${backendStatus.model})`
              : "Ollama Degraded"
            : "Probing AI Backend..."}
        </span>
      </div>

      {/* Hero Section */}
      <div className="space-y-4 max-w-lg">
        <div className="text-5xl sm:text-6xl select-none mb-2">🌿</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-950 dark:text-emerald-50">
          TouchLess AI
        </h1>
        <p className="text-xl sm:text-2xl font-serif italic text-emerald-800/90 dark:text-emerald-300/90">
          &ldquo;AI that wants you to stop using it.&rdquo;
        </p>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pt-2">
          Get a small outdoor mission. Put your phone away.
          <br className="hidden sm:inline" />
          Spend meaningful time outside and return different.
        </p>
      </div>

      {/* Primary CTA */}
      <div className="w-full max-w-xs space-y-3">
        <Link
          href="/mission/setup"
          className="w-full py-3.5 px-6 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white font-semibold text-base flex items-center justify-center gap-2 shadow-md shadow-emerald-900/15 transition-all"
        >
          <span>Start a Mission</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        {stats.totalCompleted > 0 && (
          <Link
            href="/history"
            className="block text-xs text-muted-foreground hover:text-emerald-700 dark:hover:text-emerald-400 underline underline-offset-4 transition-colors"
          >
            View past missions ({stats.totalCompleted})
          </Link>
        )}
      </div>

      {/* Local Statistics (Subtle, never the focus) */}
      {stats.totalCompleted > 0 ? (
        <div className="w-full max-w-sm grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 text-xs text-emerald-900 dark:text-emerald-200">
          <div className="text-center">
            <span className="block text-xl font-bold">{stats.totalCompleted}</span>
            <span className="text-[11px] text-muted-foreground">Missions completed</span>
          </div>
          <div className="text-center">
            <span className="block text-xl font-bold">{stats.totalMinutes}m</span>
            <span className="text-[11px] text-muted-foreground">Minutes outside</span>
          </div>
        </div>
      ) : null}

      {/* The Antidote to Screen Addiction */}
      <div className="w-full max-w-md pt-4 border-t border-black/5 dark:border-white/5 text-left space-y-3">
        <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground text-center">
          How It Works
        </p>

        <div className="grid grid-cols-1 gap-2.5 text-xs sm:text-sm">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-[#131d16] border border-black/5 dark:border-white/5">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-emerald-950 dark:text-emerald-100">1. Set your constraints</p>
              <p className="text-xs text-muted-foreground">Choose your time (5-60m), environment, and current mood.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-[#131d16] border border-black/5 dark:border-white/5">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
              <PhoneOff className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-emerald-950 dark:text-emerald-100">2. Put your phone away</p>
              <p className="text-xs text-muted-foreground">Enter Phone-Away Mode. No notifications, no infinite feed.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-[#131d16] border border-black/5 dark:border-white/5">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
              <Trees className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-emerald-950 dark:text-emerald-100">3. Return & reflect</p>
              <p className="text-xs text-muted-foreground">Share 1 sentence on what you observed for a brief Gemma reflection.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
