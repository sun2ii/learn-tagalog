"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { CURRICULUM } from "@/curriculum";
import { getLearnerState, migrateFromLegacy } from "@/lib/learner";
import { getToday, accuracy, formatMinutes, type TodayStats } from "@/lib/today";
import { recommendedWorkout } from "@/lib/recommend";
import { familiarSet } from "@/lib/familiar";
import { EVERYDAY_PHRASES } from "@/content/everyday";
import { EnterToStart, Eyebrow, Kbd, LinkButton } from "@/components/ui";
import type { LearnerState } from "@/curriculum/types";

const SESSIONS = [
  { min: 5, label: "5 min" },
  { min: 10, label: "10 min" },
  { min: 20, label: "20 min" },
  { min: 0, label: "Free" },
];

export default function Home() {
  const [state, setState] = useState<LearnerState | null>(null);
  const [today, setToday] = useState<TodayStats | null>(null);
  const [rec, setRec] = useState<ReturnType<typeof recommendedWorkout> | null>(null);
  const [familiar, setFamiliar] = useState(0);

  useEffect(() => {
    migrateFromLegacy();
    setState(getLearnerState());
    setToday(getToday());
    setRec(recommendedWorkout());
    setFamiliar(familiarSet().size);
  }, []);

  if (!state || !today || !rec) return null;

  const pct = (m: { totalReps: number; correct: number }) => (m.totalReps ? `${m.totalReps} reps · ${Math.round((m.correct / m.totalReps) * 100)}%` : "");
  const totalPhrases = EVERYDAY_PHRASES.reduce((n, g) => n + g.phrases.length, 0);
  const continueHref = `/gym/drill/?workout=${rec.workout.id}&reps=25`;
  const masteredCount = CURRICULUM.filter((c) => state.concepts[c.id]?.mastered).length;

  const modes = [
    { href: "/everyday/", name: "Everyday", blurb: "Phrases for the moment you land.", status: familiar ? `${familiar} / ${totalPhrases} familiar` : `${totalPhrases} phrases` },
    { href: "/gym/", name: "Grammar Gym", blurb: "Type the sentence. See why it's built that way.", status: pct(state.modeStats.gym) },
    { href: "/builder/", name: "Builder", blurb: "Assemble sentences piece by piece.", status: pct(state.modeStats.builder) },
    { href: "/questions/", name: "Questions", blurb: "Turn statements into questions and watch what moves.", status: pct(state.modeStats.questions) },
    { href: "/verbs/", name: "Verbs", blurb: "Root + family + shade. Recognize, conjugate, swap — on every verb.", status: "" },
    { href: "/library/", name: "Library", blurb: "Vocabulary, stories, and the guide — the input side.", status: "" },
  ];

  return (
    <div className="animate-rise">
      {/* Today */}
      <section className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow>Today</Eyebrow>
          {today.reps > 0 ? (
            <div className="mt-2 flex flex-wrap items-baseline gap-x-5 text-[30px] font-semibold leading-none tracking-tight tabular-nums md:text-[36px]">
              <span>{formatMinutes(today.ms)}</span>
              <span className="text-muted">{today.reps} reps</span>
              <span className="text-muted">{accuracy(today)}%</span>
            </div>
          ) : (
            <div className="tl mt-2 text-[30px] font-medium leading-none md:text-[36px]">Simulan na natin.</div>
          )}
          <div className="mt-2 text-[13px] text-faint">
            {today.reps > 0 ? (today.bestStreak >= 3 ? `best streak ${today.bestStreak}×` : "") : "Let's begin."}
            {today.dayStreak >= 2 && <span> · {today.dayStreak} days in a row</span>}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="mr-2 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-faint">Session</span>
          {SESSIONS.map((s) => (
            <Link key={s.min} href={`/session/?min=${s.min}`}
              className="h-10 rounded-lg border border-line px-3.5 text-[13.5px] font-medium leading-[38px] tabular-nums transition-colors hover:border-foreground/60">
              {s.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Continue */}
      <section className="mt-10 flex flex-col gap-5 rounded-2xl border border-line p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Eyebrow>Continue · Grammar Gym</Eyebrow>
          <div className="mt-2 text-[22px] font-semibold tracking-tight">{rec.workout.name}</div>
          <div className="tl mt-1 text-[20px] text-muted">{rec.workout.example}</div>
        </div>
        <LinkButton href={continueHref} variant="primary" size="lg">Continue <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">↵</Kbd></LinkButton>
      </section>

      {/* Modes */}
      <section className="mt-12">
        <Eyebrow>Modes</Eyebrow>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {modes.map((m) => (
            <li key={m.href}>
              <Link href={m.href} className="group flex items-center gap-6 py-5">
                <div className="min-w-0 flex-1">
                  <div className="text-[19px] font-semibold tracking-tight">{m.name}</div>
                  <div className="mt-0.5 text-[14px] text-muted">{m.blurb}</div>
                </div>
                <div className="hidden text-[12.5px] tabular-nums text-faint md:block">{m.status}</div>
                <svg className="text-faint transition-transform group-hover:translate-x-0.5" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" /></svg>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* The ladder */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <Eyebrow>The ladder</Eyebrow>
          <span className="text-[12.5px] tabular-nums text-faint">{masteredCount} / {CURRICULUM.length}</span>
        </div>
        <ol className="mt-3 flex gap-1">
          {CURRICULUM.map((c) => {
            const p = state.concepts[c.id];
            const mastered = p?.mastered;
            const current = c.id === rec.conceptId;
            const partial = p && !mastered ? Math.min(1, p.attempts / 5) * (p.correct / Math.max(1, p.attempts)) : 0;
            return (
              <li key={c.id} className="group relative min-w-0 flex-1" title={c.name}>
                <div className={`h-[6px] overflow-hidden rounded-full ${mastered ? "bg-foreground" : "bg-line"}`}>
                  {!mastered && partial > 0 && <div className="h-full bg-foreground/40" style={{ width: `${partial * 100}%` }} />}
                </div>
                <div className={`mt-2 hidden truncate text-[11px] md:block ${current ? "font-semibold text-foreground" : "text-faint"}`}>{c.name}</div>
              </li>
            );
          })}
        </ol>
        <div className="mt-2 text-[12.5px] text-muted md:hidden">Now: {rec.conceptName}</div>
      </section>

      {/* Reference */}
      <section className="mt-12">
        <Eyebrow>Reference</Eyebrow>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[14.5px]">
          <Link href="/library/guide/" className="text-foreground hover:underline">Guide</Link>
          <Link href="/map/" className="text-foreground hover:underline">The system map</Link>
          <Link href="/lesson/kain/" className="text-foreground hover:underline">Listen: Kain na tayo</Link>
          <Link href="/review/" className="text-foreground hover:underline">Review</Link>
        </div>
      </section>
      <EnterToStart href={continueHref} />
    </div>
  );
}
