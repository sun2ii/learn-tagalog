// Local storage stats tracking for Grammar Gym

"use client";

const STATS_KEY = "grammar-gym.stats.v1";

export interface GymStats {
  totalReps: number;
  correct: number;
  corrected: number;
  totalTimeMs: number;
  sessions: number;
  lastSession: number; // timestamp
  mistakes: Record<string, number>; // "dimension:value" -> count
}

function defaultStats(): GymStats {
  return {
    totalReps: 0,
    correct: 0,
    corrected: 0,
    totalTimeMs: 0,
    sessions: 0,
    lastSession: 0,
    mistakes: {},
  };
}

export function loadStats(): GymStats {
  if (typeof window === "undefined") return defaultStats();
  try {
    const stored = localStorage.getItem(STATS_KEY);
    if (!stored) return defaultStats();
    return JSON.parse(stored);
  } catch {
    return defaultStats();
  }
}

export function saveStats(stats: GymStats): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // Ignore storage errors
  }
}

export function recordRep(
  correct: boolean,
  responseTimeMs: number,
  mistakeKey?: string
): void {
  const stats = loadStats();
  stats.totalReps++;
  if (correct) {
    stats.correct++;
  } else {
    stats.corrected++;
    if (mistakeKey) {
      stats.mistakes[mistakeKey] = (stats.mistakes[mistakeKey] || 0) + 1;
    }
  }
  stats.totalTimeMs += responseTimeMs;
  saveStats(stats);
}

export function startSession(): void {
  const stats = loadStats();
  stats.sessions++;
  stats.lastSession = Date.now();
  saveStats(stats);
}

export function resetStats(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STATS_KEY);
  } catch {
    // Ignore
  }
}

export function getAccuracy(stats: GymStats): number {
  if (stats.totalReps === 0) return 0;
  return Math.round((stats.correct / stats.totalReps) * 100);
}

export function getAvgResponseTime(stats: GymStats): number {
  if (stats.totalReps === 0) return 0;
  return Math.round(stats.totalTimeMs / stats.totalReps);
}

/**
 * Get dimensions the learner struggles with, sorted by mistake count
 */
export function getWeakDimensions(stats: GymStats): string[] {
  return Object.entries(stats.mistakes)
    .sort((a, b) => b[1] - a[1])
    .map(([key]) => key);
}
