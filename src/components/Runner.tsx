"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Ex } from "@/lib/exercises";
import { BuildRep, CardRep, TypedRep } from "./reps";
import { VerbRep } from "./VerbRep";
import { Button, ExerciseBar, Kbd, ProgressLine, Stat } from "./ui";
import { recordConceptAttempt, recordModeRep, startModeSession } from "@/lib/learner";
import { addTime, recordRepToday, startSessionToday } from "@/lib/today";

/* ------------------------------------------------------------------
   Runner: plays a stream of exercises, either N reps or M minutes.
   Owns the streak, the stats, the header, and the completion screen.
   Every mode (Gym, Builder, Questions, Session) is a Runner with a
   different `next`.
   ------------------------------------------------------------------ */

type LearnerMode = "everyday" | "gym" | "builder" | "questions";
const MODE_OF: Record<Ex["kind"], LearnerMode> = { gym: "gym", build: "builder", question: "questions", card: "everyday", verb: "gym" };

export interface RunnerProps {
  title: string;
  next: (i: number) => Ex;
  total?: number;       // rep-count mode
  minutes?: number;     // timed mode (ends after the current rep)
  exitHref: string;
  againHref?: string;
  mode?: LearnerMode;   // stats bucket; defaults to the exercise kind
}

interface Stats { reps: number; correct: number; best: number; }

export function Runner({ title, next, total, minutes, exitHref, againHref, mode }: RunnerProps) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [ex, setEx] = useState<Ex | null>(null);
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState<Stats>({ reps: 0, correct: 0, best: 0 });
  const [done, setDone] = useState(false);
  const [startAt] = useState(() => Date.now());
  const [now, setNow] = useState(startAt);
  const [elapsedAtEnd, setElapsedAtEnd] = useState(0);
  const start = useRef(startAt);
  const repStart = useRef(0);
  const answered = useRef(false);

  // Boot
  useEffect(() => {
    start.current = Date.now(); repStart.current = Date.now();
    setEx(next(0));
    startSessionToday();
    const m = mode ?? "gym"; startModeSession(m);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clock for timed sessions
  useEffect(() => {
    if (!minutes || done) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [minutes, done]);

  const elapsed = now - startAt;
  const timeUp = !!minutes && elapsed >= minutes * 60000;

  const finish = useCallback(() => {
    const ms = Date.now() - start.current;
    addTime(ms);
    setElapsedAtEnd(ms);
    setDone(true);
  }, []);

  const onAnswer = useCallback((correct: boolean) => {
    if (!ex || answered.current) return;
    answered.current = true;
    const ms = Date.now() - repStart.current;
    const s = correct ? streak + 1 : 0;
    setStreak(s);
    setStats((st) => ({ reps: st.reps + 1, correct: st.correct + (correct ? 1 : 0), best: Math.max(st.best, s) }));
    recordModeRep(mode ?? MODE_OF[ex.kind], correct, ms);
    recordConceptAttempt(ex.concept, correct);
    recordRepToday(correct, s);
  }, [ex, streak, mode]);

  const onContinue = useCallback(() => {
    if (!answered.current) return;
    const n = i + 1;
    if ((total && n >= total) || timeUp) { finish(); return; }
    answered.current = false;
    repStart.current = Date.now();
    setI(n); setEx(next(n));
    window.scrollTo({ top: 0 });
  }, [i, total, timeUp, finish, next]);

  // Escape exits
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") { e.preventDefault(); if (stats.reps > 0 && !done) finish(); else router.push(exitHref); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [router, exitHref, stats.reps, done, finish]);

  const progress = useMemo(() => {
    if (total) return (i / total) * 100;
    if (minutes) return Math.min(100, (elapsed / (minutes * 60000)) * 100);
    return 0;
  }, [total, minutes, i, elapsed]);

  const headerRight = total ? `${i + 1} / ${total}` : minutes ? clock(Math.max(0, minutes * 60000 - elapsed)) : `${stats.reps}`;

  if (done) return <Summary title={title} stats={stats} elapsed={elapsedAtEnd} exitHref={exitHref} againHref={againHref} />;
  if (!ex) return null;

  return (
    <div className="flex min-h-[calc(100dvh-2rem)] flex-col">
      <ExerciseBar
        onClose={() => (stats.reps > 0 ? finish() : router.push(exitHref))}
        title={<span>{title}{streak >= 3 && <span className="ml-3 text-foreground tabular-nums animate-fade">{streak}× streak</span>}</span>}
        right={headerRight}
      />
      <ProgressLine value={progress} className="mb-10 md:mb-14" />
      <div key={i} className="flex-1">
        {ex.kind === "card" ? (
          <CardRep ex={ex} onAnswer={onAnswer} onContinue={onContinue} />
        ) : ex.kind === "verb" ? (
          <VerbRep ex={ex} onAnswer={onAnswer} onContinue={onContinue} />
        ) : ex.kind === "build" ? (
          <BuildRep ex={ex} onAnswer={onAnswer} onContinue={onContinue} />
        ) : (
          <TypedRep ex={ex} onAnswer={onAnswer} onContinue={onContinue} />
        )}
      </div>
      <div className="mt-10 text-center text-[11px] text-faint"><Kbd>esc</Kbd> finish</div>
    </div>
  );
}

function clock(ms: number) {
  const s = Math.ceil(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function Summary({ title, stats, elapsed, exitHref, againHref }: { title: string; stats: Stats; elapsed: number; exitHref: string; againHref?: string }) {
  const router = useRouter();
  const acc = stats.reps ? Math.round((stats.correct / stats.reps) * 100) : 0;
  const mins = Math.round(elapsed / 60000);
  useEffect(() => {
    const armedAt = performance.now();
    const h = (e: KeyboardEvent) => { if (e.timeStamp <= armedAt) return; if (e.key === "Enter" || e.key === " ") { e.preventDefault(); router.push(exitHref); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [router, exitHref]);
  return (
    <div className="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center text-center animate-rise">
      <div className="eyebrow">{title}</div>
      <div className="tl mt-4 text-[44px] font-medium leading-none md:text-[56px]">Tapos na.</div>
      <div className="mt-2 text-muted">{mins > 0 ? `${mins} min` : "under a minute"} · {stats.reps} reps</div>
      <div className="mt-12 grid grid-cols-3 gap-10">
        <Stat value={stats.correct} label="correct" tone="ok" />
        <Stat value={`${acc}%`} label="accuracy" />
        <Stat value={`${stats.best}×`} label="best streak" />
      </div>
      <div className="mt-14 flex gap-3">
        <Button variant="primary" onClick={() => router.push(exitHref)}>Done <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">↵</Kbd></Button>
        {againHref && <Button onClick={() => { router.replace(againHref); window.location.href = againHref; }}>Again</Button>}
      </div>
    </div>
  );
}
