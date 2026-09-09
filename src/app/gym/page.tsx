"use client";

import { useState } from "react";
import { STAGES } from "@/engine/session";
import { loadStats, getAccuracy, getAvgResponseTime } from "@/engine/stats";
import Link from "next/link";

export default function GymPage() {
  const [stats] = useState(() => loadStats());

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
              <div className="text-2xl font-bold">{getAccuracy(stats)}%</div>
              <div className="text-xs text-muted">accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{(getAvgResponseTime(stats) / 1000).toFixed(1)}s</div>
              <div className="text-xs text-muted">avg time</div>
            </div>
          </div>
        </div>
      )}

      {/* Stages */}
      <section className="space-y-2">
        <h2 className="font-semibold">Choose a stage</h2>
        <div className="space-y-2">
          {STAGES.map((stage) => (
            <Link
              key={stage.id}
              href={`/gym/stage/${stage.id}`}
              className="block rounded-2xl border border-line bg-card p-4 transition-colors hover:border-foreground/30"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-semibold">{stage.name}</span>
                <span className="text-sm text-muted">Stage {stage.id}</span>
              </div>
              <p className="text-sm text-muted">{stage.description}</p>
            </Link>
          ))}
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
