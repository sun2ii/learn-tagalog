"use client";
// Unified learner state: tracks progress across all modes and curriculum concepts

import type { LearnerState, ModeStats, ConceptProgress, Card } from "@/curriculum/types";
import { emptyLearnerState, emptyModeStats } from "@/curriculum/types";
import { getConcept } from "@/curriculum";

const STORAGE_KEY = "tagalog.learner.v1";

// Storage helpers
function read(): LearnerState {
  if (typeof window === "undefined") return emptyLearnerState();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return emptyLearnerState();
    return JSON.parse(stored) as LearnerState;
  } catch {
    return emptyLearnerState();
  }
}

function write(state: LearnerState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or unavailable
  }
}

// Public API

export function getLearnerState(): LearnerState {
  return read();
}

export function saveLearnerState(state: LearnerState): void {
  write(state);
}

// Concept progress

export function recordConceptAttempt(
  conceptId: string,
  correct: boolean
): LearnerState {
  const state = read();
  const concept = getConcept(conceptId);
  if (!concept) return state;

  const existing = state.concepts[conceptId] || {
    conceptId,
    attempts: 0,
    correct: 0,
    lastAttempt: 0,
    mastered: false,
  };

  const updated: ConceptProgress = {
    ...existing,
    attempts: existing.attempts + 1,
    correct: existing.correct + (correct ? 1 : 0),
    lastAttempt: Date.now(),
    mastered: existing.mastered,
  };

  // Recalculate mastery (minimum 5 attempts, then check threshold)
  if (updated.attempts >= 5) {
    const accuracy = updated.correct / updated.attempts;
    updated.mastered = accuracy >= concept.masteryThreshold;
  }

  const newState = {
    ...state,
    concepts: {
      ...state.concepts,
      [conceptId]: updated,
    },
  };

  write(newState);
  return newState;
}

export function getConceptProgress(conceptId: string): ConceptProgress | null {
  const state = read();
  return state.concepts[conceptId] || null;
}

// Mode stats

export function recordModeRep(
  mode: "everyday" | "gym" | "builder" | "questions",
  correct: boolean,
  responseTimeMs: number
): LearnerState {
  const state = read();
  const existing = state.modeStats[mode] || emptyModeStats();

  const updated: ModeStats = {
    totalReps: existing.totalReps + 1,
    correct: existing.correct + (correct ? 1 : 0),
    totalTimeMs: existing.totalTimeMs + responseTimeMs,
    sessions: existing.sessions,
    lastSession: existing.lastSession,
  };

  const newState = {
    ...state,
    modeStats: {
      ...state.modeStats,
      [mode]: updated,
    },
  };

  write(newState);
  return newState;
}

export function startModeSession(
  mode: "everyday" | "gym" | "builder" | "questions"
): LearnerState {
  const state = read();
  const existing = state.modeStats[mode] || emptyModeStats();

  const updated: ModeStats = {
    ...existing,
    sessions: existing.sessions + 1,
    lastSession: Date.now(),
  };

  const newState = {
    ...state,
    modeStats: {
      ...state.modeStats,
      [mode]: updated,
    },
  };

  write(newState);
  return newState;
}

export function getModeStats(
  mode: "everyday" | "gym" | "builder" | "questions"
): ModeStats {
  const state = read();
  return state.modeStats[mode] || emptyModeStats();
}

// Spaced repetition cards (for phrases, etc.)

const INTERVALS_H = [0, 4, 24, 72, 168, 336]; // hours per box

export function rateCard(id: string, gotIt: boolean): LearnerState {
  const state = read();
  const existing = state.cards[id] || { id, box: 0, due: 0, seen: 0 };

  const newBox = gotIt
    ? Math.min(existing.box + 1, INTERVALS_H.length - 1)
    : 0;

  const updated: Card = {
    id,
    box: newBox,
    due: Date.now() + INTERVALS_H[newBox] * 3600_000,
    seen: existing.seen + 1,
  };

  const newState = {
    ...state,
    cards: {
      ...state.cards,
      [id]: updated,
    },
  };

  write(newState);
  return newState;
}

export function getCard(id: string): Card | null {
  const state = read();
  return state.cards[id] || null;
}

export function getDueCardIds(): string[] {
  const state = read();
  const now = Date.now();
  return Object.values(state.cards)
    .filter(c => c.due <= now)
    .map(c => c.id);
}

export function getAllCards(): Card[] {
  const state = read();
  return Object.values(state.cards);
}

// Reset

export function resetLearnerState(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}

// Migration from old progress systems
// Call this once on app init to migrate existing data

export function migrateFromLegacy(): void {
  if (typeof window === "undefined") return;

  const state = read();

  // Already has data? Skip migration
  if (Object.keys(state.concepts).length > 0 || Object.keys(state.cards).length > 0) {
    return;
  }

  try {
    // Migrate old progress.ts cards
    const oldProgress = localStorage.getItem("tagalog.progress.v1");
    if (oldProgress) {
      const oldCards = JSON.parse(oldProgress) as Record<string, Card>;
      state.cards = oldCards;
    }

    // Migrate old gym stats
    const oldStats = localStorage.getItem("grammar-gym.stats.v1");
    if (oldStats) {
      const gymStats = JSON.parse(oldStats);
      state.modeStats.gym = {
        totalReps: gymStats.totalReps || 0,
        correct: gymStats.correct || 0,
        totalTimeMs: gymStats.totalTimeMs || 0,
        sessions: gymStats.sessions || 0,
        lastSession: gymStats.lastSession || 0,
      };
    }

    write(state);
  } catch {
    // Migration failed, start fresh
  }
}
