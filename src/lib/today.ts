"use client";
// Quiet session bookkeeping: what happened today, and the day streak.
// Deliberately small. Everything here is derived from reps you actually did.

const KEY = "tagalog.today.v1";

export interface TodayStats {
  date: string;        // YYYY-MM-DD local
  ms: number;          // time spent inside exercises
  reps: number;
  correct: number;
  bestStreak: number;  // longest run of correct answers today
  sessions: number;
  dayStreak: number;   // consecutive days with ≥1 rep (including today once you rep)
  lastRepDate: string; // YYYY-MM-DD of the last rep
}

function localDate(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function empty(date: string): TodayStats {
  return { date, ms: 0, reps: 0, correct: 0, bestStreak: 0, sessions: 0, dayStreak: 0, lastRepDate: "" };
}

function read(): TodayStats {
  const today = localDate();
  if (typeof window === "undefined") return empty(today);
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty(today);
    const s = JSON.parse(raw) as TodayStats;
    if (s.date !== today) {
      // New day: keep the day streak info, reset the daily counters.
      const fresh = empty(today);
      fresh.dayStreak = s.dayStreak;
      fresh.lastRepDate = s.lastRepDate;
      return fresh;
    }
    return s;
  } catch {
    return empty(today);
  }
}

function write(s: TodayStats) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

export function getToday(): TodayStats { return read(); }

export function addTime(ms: number) {
  const s = read(); s.ms += Math.max(0, ms); write(s);
}

export function startSessionToday() {
  const s = read(); s.sessions += 1; write(s);
}

/** Record one rep. `streak` is the caller's current run of correct answers. */
export function recordRepToday(correct: boolean, streak: number) {
  const s = read();
  s.reps += 1;
  if (correct) s.correct += 1;
  if (streak > s.bestStreak) s.bestStreak = streak;
  // Day streak: yesterday → +1, today already → unchanged, otherwise → 1
  const today = s.date;
  if (s.lastRepDate !== today) {
    const y = new Date(); y.setDate(y.getDate() - 1);
    s.dayStreak = s.lastRepDate === localDate(y) ? s.dayStreak + 1 : 1;
    s.lastRepDate = today;
  }
  write(s);
}

export function accuracy(s: { reps: number; correct: number }): number {
  return s.reps ? Math.round((s.correct / s.reps) * 100) : 0;
}

export function formatMinutes(ms: number): string {
  const m = Math.round(ms / 60000);
  return m < 1 ? "<1 min" : `${m} min`;
}
