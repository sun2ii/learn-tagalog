"use client";
// Phrases you've marked as "I know this". Separate from the SRS boxes so a
// tap on ✓ means exactly one thing.
const KEY = "tagalog.familiar.v1";

function read(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(KEY) || "[]") as string[]); } catch { return new Set(); }
}
export function familiarSet(): Set<string> { return typeof window === "undefined" ? new Set() : read(); }
export function toggleFamiliar(id: string): Set<string> {
  const s = read(); if (s.has(id)) s.delete(id); else s.add(id);
  try { localStorage.setItem(KEY, JSON.stringify([...s])); } catch {}
  return s;
}
