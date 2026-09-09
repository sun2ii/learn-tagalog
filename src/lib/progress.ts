"use client";
// Tiny spaced-repetition store in localStorage (Leitner boxes).
// box 0 = new/missed → due now; each "got it" moves it up and pushes the due date out.

export interface Card { id: string; box: number; due: number; seen: number }
const KEY = "tagalog.progress.v1";
const INTERVALS_H = [0, 4, 24, 72, 168, 336]; // hours per box

function read(): Record<string, Card> {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; }
}
function write(d: Record<string, Card>) {
  try { localStorage.setItem(KEY, JSON.stringify(d)); } catch {}
}

export function getCard(id: string): Card | undefined { return read()[id]; }

export function rate(id: string, gotIt: boolean) {
  const d = read();
  const c = d[id] ?? { id, box: 0, due: 0, seen: 0 };
  c.box = gotIt ? Math.min(c.box + 1, INTERVALS_H.length - 1) : 0;
  c.due = Date.now() + INTERVALS_H[c.box] * 3600_000;
  c.seen += 1;
  d[id] = c; write(d);
}

export function dueIds(): string[] {
  const now = Date.now();
  return Object.values(read()).filter((c) => c.due <= now).map((c) => c.id);
}

export function allCards(): Card[] { return Object.values(read()); }

export function resetProgress() { try { localStorage.removeItem(KEY); } catch {} }
