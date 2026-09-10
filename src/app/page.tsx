"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CURRICULUM, getConcept } from "@/curriculum";
import { getLearnerState, migrateFromLegacy } from "@/lib/learner";
import { getUnlockedConcepts, getCurrentConcept, getProgressSummary } from "@/curriculum/unlock";
import type { LearnerState } from "@/curriculum/types";

export default function Home() {
  const [state, setState] = useState<LearnerState | null>(null);

  useEffect(() => {
    migrateFromLegacy();
    setState(getLearnerState());
  }, []);

  if (!state) {
    return <div className="p-4">Loading...</div>;
  }

  const summary = getProgressSummary(state);
  const currentConcept = summary.currentConcept ? getConcept(summary.currentConcept) : null;
  const unlockedConcepts = getUnlockedConcepts(state);

  // Calculate total stats across all modes
  const totalReps =
    state.modeStats.everyday.totalReps +
    state.modeStats.gym.totalReps +
    state.modeStats.builder.totalReps +
    state.modeStats.questions.totalReps;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Tagalog</h1>
        <p className="text-muted">Build the language one primitive at a time.</p>
      </div>

      {/* Progress overview */}
      <section className="rounded-2xl border border-line bg-card p-4 space-y-3">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Progress</h2>
          <span className="text-sm text-muted">{summary.percentComplete}% complete</span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-action rounded-full transition-all"
            style={{ width: `${summary.percentComplete}%` }}
          />
        </div>

        {/* Current focus */}
        {currentConcept && (
          <div className="text-sm">
            <span className="text-muted">Currently learning: </span>
            <span className="font-medium">{currentConcept.name}</span>
          </div>
        )}

        {/* Stats row */}
        {totalReps > 0 && (
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-line/50">
            <div>
              <div className="text-2xl font-bold">{totalReps}</div>
              <div className="text-xs text-muted">total reps</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{summary.masteredConcepts}/{summary.totalConcepts}</div>
              <div className="text-xs text-muted">concepts mastered</div>
            </div>
          </div>
        )}
      </section>

      {/* Curriculum overview */}
      <section className="space-y-2">
        <h2 className="font-semibold">Curriculum</h2>
        <div className="space-y-1">
          {CURRICULUM.map((concept, i) => {
            const isUnlocked = unlockedConcepts.includes(concept.id);
            const isMastered = state.concepts[concept.id]?.mastered;
            const isCurrent = concept.id === summary.currentConcept;

            return (
              <div
                key={concept.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${
                  isCurrent
                    ? "border-action bg-action/10"
                    : isMastered
                    ? "border-green-500/30 bg-green-500/5"
                    : isUnlocked
                    ? "border-line bg-card"
                    : "border-line/30 bg-card/50 opacity-50"
                }`}
              >
                <span className="w-6 text-center text-sm text-muted">
                  {isMastered ? "✓" : i + 1}
                </span>
                <div className="flex-1">
                  <div className={`font-medium ${!isUnlocked ? "text-muted" : ""}`}>
                    {concept.name}
                  </div>
                  <div className="text-xs text-muted">{concept.description}</div>
                </div>
                {isCurrent && (
                  <span className="text-xs text-action font-medium">current</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick actions */}
      <section className="space-y-2">
        <h2 className="font-semibold">Quick Start</h2>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/gym/"
            className="rounded-2xl border border-line bg-card p-4 transition-colors hover:border-foreground/30"
          >
            <div className="text-lg font-semibold">◎ Grammar Gym</div>
            <div className="text-sm text-muted">Pattern reps</div>
          </Link>
          <Link
            href="/everyday/"
            className="rounded-2xl border border-line bg-card p-4 transition-colors hover:border-foreground/30"
          >
            <div className="text-lg font-semibold">💬 Everyday</div>
            <div className="text-sm text-muted">Useful phrases</div>
          </Link>
          <Link
            href="/builder/"
            className="rounded-2xl border border-line bg-card p-4 transition-colors hover:border-foreground/30"
          >
            <div className="text-lg font-semibold">⊞ Sentence Builder</div>
            <div className="text-sm text-muted">Construct sentences</div>
          </Link>
          <Link
            href="/questions/"
            className="rounded-2xl border border-line bg-card p-4 transition-colors hover:border-foreground/30"
          >
            <div className="text-lg font-semibold">? Questions</div>
            <div className="text-sm text-muted">Learn to ask</div>
          </Link>
        </div>
      </section>

      {/* System reference */}
      <section className="space-y-2">
        <h2 className="font-semibold">Reference</h2>
        <Link
          href="/map/"
          className="block rounded-2xl border border-line bg-card p-4 transition-colors hover:border-foreground/30"
        >
          <div className="font-semibold">◈ System Map</div>
          <div className="text-sm text-muted">The grammar skeleton in one screen</div>
        </Link>
      </section>
    </div>
  );
}
