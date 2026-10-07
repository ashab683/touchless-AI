"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Trash2,
  Clock,
  MapPin,
  Smile,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Compass,
} from "lucide-react";
import {
  getStoredMissions,
  deleteMission,
  clearAllMissions,
  calculateStats,
} from "@/lib/storage";
import { StoredMission } from "@/types/mission";

export default function HistoryPage() {
  const [missions, setMissions] = useState<StoredMission[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setMissions(getStoredMissions());
  }, []);

  const stats = calculateStats(missions);

  const handleDelete = (id: string) => {
    if (confirm("Delete this mission from your local history?")) {
      deleteMission(id);
      setMissions(getStoredMissions());
    }
  };

  const handleClearAll = () => {
    if (confirm("Clear all mission history? This action cannot be undone.")) {
      clearAllMissions();
      setMissions([]);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-950 dark:text-emerald-50">
              Outdoor History
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Stored locally on your device. Completely private.
            </p>
          </div>
        </div>

        {missions.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-red-600 dark:text-red-400 hover:underline cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Aggregate Stats Dashboard */}
      {missions.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 p-4 rounded-3xl bg-white dark:bg-[#131d16] border border-black/5 dark:border-white/5 text-center">
          <div className="p-2">
            <span className="block text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">
              {stats.totalCompleted}
            </span>
            <span className="text-[11px] text-muted-foreground">Missions Done</span>
          </div>

          <div className="p-2 border-x border-black/5 dark:border-white/5">
            <span className="block text-2xl font-extrabold text-emerald-800 dark:text-emerald-300">
              {stats.totalMinutes}m
            </span>
            <span className="text-[11px] text-muted-foreground">Offline Time</span>
          </div>

          <div className="p-2">
            <span className="block text-sm sm:text-base font-bold text-emerald-800 dark:text-emerald-300 truncate">
              {stats.favoriteEnv}
            </span>
            <span className="text-[11px] text-muted-foreground">Top Habitat</span>
          </div>
        </div>
      )}

      {/* Mission List */}
      {missions.length === 0 ? (
        <div className="py-16 text-center space-y-4 rounded-3xl bg-white dark:bg-[#131d16] border border-black/5 dark:border-white/5 p-8">
          <div className="text-4xl">🌱</div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
              No missions recorded yet
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Your outdoor adventures will show up here after you generate and complete your first mission.
            </p>
          </div>
          <Link
            href="/mission/setup"
            className="inline-flex py-3 px-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs sm:text-sm items-center gap-2 transition-all shadow-xs"
          >
            <Compass className="w-4 h-4" />
            <span>Generate First Mission</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {missions.map((m) => {
            const isExpanded = expandedId === m.id;
            const dateStr = new Date(m.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={m.id}
                className="rounded-2xl bg-white dark:bg-[#131d16] border border-black/5 dark:border-white/5 shadow-xs overflow-hidden transition-all"
              >
                {/* Header row */}
                <div
                  onClick={() => toggleExpand(m.id)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {m.completed_at ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Completed
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full">
                          In Progress
                        </span>
                      )}
                      <span className="text-[11px] text-muted-foreground">{dateStr}</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-emerald-950 dark:text-emerald-50">
                      {m.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{m.duration} mins</span>
                      <span>•</span>
                      <span>{m.environment}</span>
                      <span>•</span>
                      <span>{m.goal}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-black/5 dark:border-white/5 space-y-4 text-xs sm:text-sm">
                    {/* Instructions */}
                    <div className="pt-3 space-y-2">
                      <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground block">
                        Instructions:
                      </span>
                      <ol className="space-y-1.5 pl-4 list-decimal text-emerald-950 dark:text-emerald-100">
                        {m.instructions.map((step, idx) => (
                          <li key={idx} className="leading-snug">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Bonus challenge */}
                    {m.challenge && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-950 dark:text-amber-200">
                        <span className="font-bold block text-amber-800 dark:text-amber-400">
                          🎯 Constraint:
                        </span>
                        <p>{m.challenge}</p>
                      </div>
                    )}

                    {/* User reflection */}
                    {m.user_reflection && (
                      <div className="space-y-1">
                        <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground block">
                          Your Reflection:
                        </span>
                        <p className="italic bg-emerald-500/5 p-3 rounded-xl text-emerald-950 dark:text-emerald-100">
                          &ldquo;{m.user_reflection}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Gemma AI reflection */}
                    {m.ai_reflection && (
                      <div className="space-y-1">
                        <span className="font-bold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          Gemma 3 Grounding:
                        </span>
                        <p className="font-serif leading-relaxed text-emerald-950 dark:text-emerald-100">
                          {m.ai_reflection}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-2">
                      <Link
                        href={`/mission/${m.id}`}
                        className="text-xs text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
                      >
                        Open Active Card →
                      </Link>

                      <button
                        onClick={() => handleDelete(m.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Delete mission"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
