// Curriculum types: the shared progression system across all modes

export interface Concept {
  id: string;
  name: string;
  description: string;
  prerequisites: string[];
  vocabulary: VocabularySet;
  masteryThreshold: number; // 0-1, e.g., 0.8 = 80% accuracy to unlock next
}

export interface VocabularySet {
  pronouns?: string[];
  verbs?: string[];
  nouns?: string[];
  times?: string[];
  particles?: string[];    // hindi, ba, question words
  connectors?: string[];   // at, pero, kasi
}

// Learner's progress on a single concept
export interface ConceptProgress {
  conceptId: string;
  attempts: number;
  correct: number;
  lastAttempt: number;
  mastered: boolean;
}

// Per-mode statistics
export interface ModeStats {
  totalReps: number;
  correct: number;
  totalTimeMs: number;
  sessions: number;
  lastSession: number;
}

// Unified learner state across all modes
export interface LearnerState {
  version: number;
  concepts: Record<string, ConceptProgress>;
  modeStats: {
    everyday: ModeStats;
    gym: ModeStats;
    builder: ModeStats;
    questions: ModeStats;
  };
  // Spaced repetition cards (phrase IDs, etc.)
  cards: Record<string, Card>;
}

export interface Card {
  id: string;
  box: number;
  due: number;
  seen: number;
}

// Default empty stats
export function emptyModeStats(): ModeStats {
  return {
    totalReps: 0,
    correct: 0,
    totalTimeMs: 0,
    sessions: 0,
    lastSession: 0,
  };
}

export function emptyLearnerState(): LearnerState {
  return {
    version: 1,
    concepts: {},
    modeStats: {
      everyday: emptyModeStats(),
      gym: emptyModeStats(),
      builder: emptyModeStats(),
      questions: emptyModeStats(),
    },
    cards: {},
  };
}
