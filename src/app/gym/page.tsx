"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { WORKOUTS } from "@/lib/exercises";
import { getLearnerState } from "@/lib/learner";
import { recommendedWorkout } from "@/lib/recommend";
import { EnterToStart, Eyebrow, Kbd, LinkButton } from "@/components/ui";
import type { LearnerState } from "@/curriculum/types";

const REPS = [10, 25, 50];

export default function GymPage() {
  const [state, setState] = useState<LearnerState | null>(null);
  const [rec, setRec] = useState<ReturnType<typeof recommendedWorkout> | null>(null);
  useEffect(() => { setState(getLearnerState()); setRec(recommendedWorkout()); }, []);

  const s = state?.modeStats.gym;
  const acc = s && s.totalReps ? Math.round((s.correct / s.totalReps) * 100) : null;

  return (
    <div className="animate-rise">
      <header className="flex items-end justify-between">
        <div>
          <Eyebrow>Grammar Gym</Eyebrow>
          <h1 className="mt-2 text-[34px] font-semibold leading-none tracking-tight">Reps until it&rsquo;s instinct.</h1>
        </div>
        {s && s.totalReps > 0 && <div className="text-right text-[13px] tabular-nums text-muted">{s.totalReps} reps · {acc}%</div>}
      </header>

      {rec && (
        <section className="mt-10 flex flex-col gap-5 rounded-2xl border border-line p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Eyebrow>Continue · {rec.conceptName}</Eyebrow>
            <div className="mt-2 text-[22px] font-semibold tracking-tight">{rec.workout.name}</div>
            <div className="tl mt-1 text-[20px] text-muted">{rec.workout.example}</div>
          </div>
          <LinkButton href={`/gym/drill/?workout=${rec.workout.id}&reps=25`} variant="primary" size="lg">Start 25 reps <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">↵</Kbd></LinkButton>
        </section>
      )}

      <section className="mt-12">
        <Eyebrow>Workouts</Eyebrow>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {WORKOUTS.map((w) => (
            <li key={w.id} className="flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="text-[17px] font-semibold tracking-tight">{w.name}</div>
                <div className="mt-0.5 text-[13.5px] text-muted">{w.tagline}</div>
                <div className="tl mt-2 text-[19px]">{w.example}</div>
              </div>
              <div className="flex shrink-0 gap-1.5">
                {REPS.map((n) => (
                  <Link key={n} href={`/gym/drill/?workout=${w.id}&reps=${n}`}
                    className="h-9 min-w-12 rounded-lg border border-line px-3 text-center text-[13px] font-medium leading-9 tabular-nums transition-colors hover:border-foreground/60">
                    {n}
                  </Link>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>
      <EnterToStart href={rec ? `/gym/drill/?workout=${rec.workout.id}&reps=25` : null} />
    </div>
  );
}
