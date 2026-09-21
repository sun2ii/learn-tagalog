"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { rateCard, recordModeRep, startModeSession } from "@/lib/learner";
import { addTime, recordRepToday, startSessionToday } from "@/lib/today";
import { Button, ExerciseBar, Eyebrow, Kbd, ProgressLine, Stat } from "./ui";

/* Flashcards: front → recall → reveal back → rate. Missed cards return at the end.
   Used by Everyday (phrases) and Vocabulary (words). */

export interface Card {
  id: string;         // SRS key
  front: string;      // English prompt
  back: string;       // Tagalog
  sub?: string;       // second line under the back (forms, polite variant…)
  note?: string;
  aspect?: "contemplated" | "ongoing" | "completed"; // verb-form cards: colors the back
}

export function Flashcards({ title, cards, exitHref, mode = "everyday" }: { title: string; cards: Card[]; exitHref: string; mode?: "everyday" | "gym" | "builder" | "questions" }) {
  const router = useRouter();
  const [queue, setQueue] = useState<Card[]>([]);
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const [stats, setStats] = useState({ reps: 0, correct: 0, best: 0, streak: 0 });
  const start = useRef(Date.now());
  const repStart = useRef(Date.now());

  useEffect(() => { setQueue(cards); startModeSession(mode); startSessionToday(); start.current = Date.now(); }, [cards, mode]);

  const card = queue[i];
  const done = queue.length > 0 && i >= queue.length;

  const rate = useCallback((gotIt: boolean) => {
    if (!card) return;
    rateCard(card.id, gotIt);
    recordModeRep(mode, gotIt, Date.now() - repStart.current);
    const streak = gotIt ? stats.streak + 1 : 0;
    recordRepToday(gotIt, streak);
    setStats((s) => ({ reps: s.reps + 1, correct: s.correct + (gotIt ? 1 : 0), best: Math.max(s.best, streak), streak }));
    if (!gotIt) setQueue((q) => [...q, card]);
    setI((k) => k + 1); setShown(false); repStart.current = Date.now();
  }, [card, stats.streak, mode]);

  useEffect(() => { if (done) addTime(Date.now() - start.current); }, [done]);

  useEffect(() => {
    const armedAt = performance.now();
    const h = (e: KeyboardEvent) => {
      if (e.timeStamp <= armedAt) return;
      if (e.key === "Escape") { router.push(exitHref); return; }
      if (done) { if (e.key === "Enter" || e.key === " ") router.push(exitHref); return; }
      if (!shown) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setShown(true); } return; }
      if (e.key === "1" || e.key === "ArrowLeft") { e.preventDefault(); rate(false); }
      else if (e.key === "2" || e.key === "ArrowRight" || e.key === " " || e.key === "Enter") { e.preventDefault(); rate(true); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [shown, done, rate, router, exitHref]);

  if (cards.length === 0) {
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center text-center">
        <div className="tl text-[32px] font-medium">Wala pang due.</div>
        <div className="mt-2 text-muted">Nothing is due. Pick a group instead.</div>
        <Button className="mt-8" onClick={() => router.push(exitHref)}>Back</Button>
      </div>
    );
  }
  if (!card && !done) return null;

  if (done) {
    const acc = Math.round((stats.correct / stats.reps) * 100);
    return (
      <div className="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center text-center animate-rise">
        <div className="eyebrow">{title}</div>
        <div className="tl mt-4 text-[44px] font-medium leading-none md:text-[56px]">Tapos na.</div>
        <div className="mt-12 grid grid-cols-3 gap-10">
          <Stat value={stats.correct} label="got it" tone="ok" />
          <Stat value={`${acc}%`} label="first try" />
          <Stat value={`${stats.best}×`} label="best streak" />
        </div>
        <Button variant="primary" className="mt-14" onClick={() => router.push(exitHref)}>Done <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">↵</Kbd></Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100dvh-2rem)] flex-col">
      <ExerciseBar onClose={() => router.push(exitHref)} title={<span>{title}{stats.streak >= 3 && <span className="ml-3 text-foreground tabular-nums">{stats.streak}× streak</span>}</span>} right={`${i + 1} / ${queue.length}`} />
      <ProgressLine value={(i / queue.length) * 100} className="mb-10" />
      <div key={i} className="flex flex-1 flex-col items-center justify-center text-center animate-rise-fast">
        <Eyebrow>How do you say</Eyebrow>
        <div className="mt-4 max-w-2xl text-[28px] font-medium leading-tight tracking-tight md:text-[38px]">{card.front}</div>
        <div className="mt-12 min-h-[120px]">
          {shown ? (
            <div className="animate-rise">
              <div className="tl text-[36px] font-medium leading-tight md:text-[48px]" data-aspect={card.aspect}>{card.back}</div>
              {card.sub && <div className="tl mt-2 text-[18px] text-muted">{card.sub}</div>}
              {card.note && <div className="mx-auto mt-4 max-w-md text-[14px] text-muted">{card.note}</div>}
            </div>
          ) : (
            <Button variant="primary" size="lg" onClick={() => setShown(true)}>Reveal <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">⎵</Kbd></Button>
          )}
        </div>
        {shown && (
          <div className="mt-8 flex gap-3 animate-fade">
            <Button size="lg" onClick={() => rate(false)} className="!border-err/50 !text-err">Again <Kbd>1</Kbd></Button>
            <Button size="lg" onClick={() => rate(true)} className="!border-ok/50 !text-ok">Got it <Kbd>2</Kbd></Button>
          </div>
        )}
      </div>
      <div className="mt-10 text-center text-[11px] text-faint"><Kbd>esc</Kbd> exit</div>
    </div>
  );
}
