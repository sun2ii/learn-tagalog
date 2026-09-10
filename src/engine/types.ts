// Engine types: language-agnostic sentence representation

export type Dimension = "aspect" | "actor" | "object" | "time" | "focus" | "polarity" | "mood";
export type Focus = "actor" | "object";
export type Polarity = "affirmative" | "negative";
export type Mood = "statement" | "yes_no" | "wh_question";
export type QuestionWord = "ano" | "sino" | "saan" | "kailan" | "bakit" | "paano";

export interface SentenceState {
  root: string;
  aspect: string;
  actor: string;
  focus: Focus;
  object?: string;
  time?: string;
  // New fields for negation and questions
  polarity?: Polarity;           // defaults to "affirmative"
  mood?: Mood;                   // defaults to "statement"
  questionWord?: QuestionWord;   // only when mood is "wh_question"
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
