"use client";

import { useState, useEffect } from "react";
import { STAGES } from "@/engine/session";
import { getModeStats } from "@/lib/learner";
import { CURRICULUM, getConcept } from "@/curriculum";
import { getUnlockedConcepts, getCurrentConcept } from "@/curriculum/unlock";
import { getLearnerState } from "@/lib/learner";
import Link from "next/link";
import type { LearnerState } from "@/curriculum/types";

export default function GymPage() {
  const [state, setState] = useState<LearnerState | null>(null);

  useEffect(() => {
    setState(getLearnerState());
  }, []);

  const stats = state?.modeStats.gym || { totalReps: 0, correct: 0, totalTimeMs: 0, sessions: 0, lastSession: 0 };
  const accuracy = stats.totalReps > 0 ? Math.round((stats.correct / stats.totalReps) * 100) : 0;
  const avgTime = stats.totalReps > 0 ? stats.totalTimeMs / stats.totalReps : 0;

  const unlockedConcepts = state ? getUnlockedConcepts(state) : ["actor"];
  const currentConceptId = state ? getCurrentConcept(state) : "actor";
  const currentConcept = currentConceptId ? getConcept(currentConceptId) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Grammar Gym</h1>
        <p className="text-muted">
          Spam reps until patterns become automatic.
        </p>
      </div>

      {/* Quick stats */}
      {stats.totalReps > 0 && (
        <div className="rounded-2xl border border-line bg-card p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{stats.totalReps}</div>
              <div className="text-xs text-muted">total reps</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{accuracy}%</div>
              <div className="text-xs text-muted">accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{(avgTime / 1000).toFixed(1)}s</div>
              <div className="text-xs text-muted">avg time</div>
            </div>
          </div>
        </div>
      )}

      {/* Current focus */}
      {currentConcept && (
        <div className="rounded-2xl border border-action/30 bg-action/5 p-4">
          <div className="text-sm text-muted">Currently practicing</div>
          <div className="text-lg font-semibold">{currentConcept.name}</div>
          <div className="text-sm text-muted">{currentConcept.description}</div>
        </div>
      )}

      {/* Stages */}
      <section className="space-y-2">
        <h2 className="font-semibold">Choose a stage</h2>
        <div className="space-y-2">
          {STAGES.map((stage) => {
            // Stage 1 = actor focus (concepts: actor, aspect, object, time)
            // Stage 2 = focus/voice (requires "focus" concept)
            const isUnlocked = stage.id === "1" || unlockedConcepts.includes("focus");

            return (
              <Link
                key={stage.id}
                href={isUnlocked ? `/gym/stage/${stage.id}` : "#"}
                className={`block rounded-2xl border p-4 transition-colors ${
                  isUnlocked
                    ? "border-line bg-card hover:border-foreground/30"
                    : "border-line/30 bg-card/50 opacity-50 cursor-not-allowed"
                }`}
                onClick={(e) => !isUnlocked && e.preventDefault()}
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-semibold">{stage.name}</span>
                  <span className="text-sm text-muted">
                    {isUnlocked ? `Stage ${stage.id}` : "🔒 Locked"}
                  </span>
                </div>
                <p className="text-sm text-muted">{stage.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Quick drill button */}
      <Link
        href="/gym/drill?stage=1&reps=25"
        className="block rounded-2xl border-2 border-action bg-action/10 p-4 text-center font-semibold text-action transition-colors hover:bg-action/20"
      >
        Quick Drill: 25 reps
      </Link>
    </div>
  );
}
