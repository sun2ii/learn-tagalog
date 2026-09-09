// Engine types: language-agnostic sentence representation

export type Dimension = "aspect" | "actor" | "object" | "time" | "focus";
export type Focus = "actor" | "object";

export interface SentenceState {
  root: string;
  aspect: string;
  actor: string;
  focus: Focus;
  object?: string;
  time?: string;
}

export interface StateDiff {
  dimension: Dimension;
  from: string;
  to: string;
}

export type ExerciseMode = "exposure" | "notice" | "predict" | "produce" | "mix";

export interface Exercise {
  mode: ExerciseMode;
  current: SentenceState;
  previous?: SentenceState;
  diff?: StateDiff;
  prompt?: string; // English prompt for predict/produce
}

export interface SessionConfig {
  repCount: number;
  stages: ExerciseMode[];
  rootFilter?: string[];
}

export interface RepResult {
  state: SentenceState;
  mode: ExerciseMode;
  correct: boolean;
  responseTimeMs: number;
  userAnswer?: string;
}

export interface SessionStats {
  totalReps: number;
  correct: number;
  corrected: number;
  avgResponseMs: number;
  durationMs: number;
  mistakes: Map<string, number>; // dimension:value -> count
}
