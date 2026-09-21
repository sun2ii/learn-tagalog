// Session engine: generates exercises with controlled variation

import type { SentenceState, Exercise, ExerciseMode, Dimension, StateDiff } from "./types";
import { diffStates, stateKey } from "./diff";
import { transform } from "./transform";
import { PRONOUN_KEYS } from "@/languages/tagalog/pronouns";
import { NOUN_KEYS, getNounsForVerb, FOOD_NOUNS, DRINK_NOUNS } from "@/languages/tagalog/nouns";
import { TIME_KEYS, isTimeCompatible } from "@/languages/tagalog/time";
import { render, isValidState } from "@/languages/tagalog/renderer";
import { VERBS, TRANSITIVE_VERB_ROOTS, isTransitive } from "@/languages/tagalog/verbs";

// Stage configuration
// Philosophy: DEPTH FIRST. Master patterns with kain first, then expand verbs.
import type { Focus } from "./types";

export interface Stage {
  id: string;
  name: string;
  description: string;
  allowedDimensions: Dimension[];
  requireObject: boolean;
  allowTime: boolean;
  aspects: string[];
  pronouns: string[];
  objects: string[];
  // Focus switching for Stage 2+
  focusTypes: Focus[];
  // Which verb roots are used in this stage
  verbRoots: string[];
}

export const STAGES: Stage[] = [
  {
    id: "1",
    name: "Actor Focus: Kain",
    description: "Eating sentences with actor focus",
    allowedDimensions: ["aspect", "actor", "object", "time"],
    requireObject: true,
    allowTime: true,
    aspects: ["completed", "ongoing", "contemplated"],
    pronouns: PRONOUN_KEYS,
    objects: FOOD_NOUNS, // Only food for kain
    focusTypes: ["actor"],
    verbRoots: ["kain"],
  },
  {
    id: "2",
    name: "Focus / Voice",
    description: "Same event, different focus",
    allowedDimensions: ["aspect", "actor", "object", "focus"],
    requireObject: true,
    allowTime: false,
    aspects: ["completed", "ongoing", "contemplated"],
    pronouns: PRONOUN_KEYS,
    objects: FOOD_NOUNS, // Keep food for consistency
    focusTypes: ["actor", "object"],
    verbRoots: ["kain"],
  },
  {
    id: "3",
    name: "Inom: Drinking",
    description: "Drinking sentences with actor focus",
    allowedDimensions: ["aspect", "actor", "object", "time"],
    requireObject: true,
    allowTime: true,
    aspects: ["completed", "ongoing", "contemplated"],
    pronouns: PRONOUN_KEYS,
    objects: DRINK_NOUNS,
    focusTypes: ["actor"],
    verbRoots: ["inom"],
  },
  {
    id: "4",
    name: "Kuha & Bili",
    description: "Getting and buying things",
    allowedDimensions: ["aspect", "actor", "object"],
    requireObject: true,
    allowTime: false,
    aspects: ["completed", "ongoing", "contemplated"],
    pronouns: PRONOUN_KEYS,
    objects: [], // Will be filled dynamically per verb
    focusTypes: ["actor"],
    verbRoots: ["kuha", "bili"],
  },
  {
    id: "5",
    name: "Basa & Sulat",
    description: "Reading and writing",
    allowedDimensions: ["aspect", "actor", "object"],
    requireObject: true,
    allowTime: false,
    aspects: ["completed", "ongoing", "contemplated"],
    pronouns: PRONOUN_KEYS,
    objects: [], // Will be filled dynamically per verb
    focusTypes: ["actor"],
    verbRoots: ["basa", "sulat"],
  },
  {
    id: "6",
    name: "Gawa: Making",
    description: "Making things",
    allowedDimensions: ["aspect", "actor", "object"],
    requireObject: true,
    allowTime: false,
    aspects: ["completed", "ongoing", "contemplated"],
    pronouns: PRONOUN_KEYS,
    objects: [], // Will be filled dynamically
    focusTypes: ["actor"],
    verbRoots: ["gawa"],
  },
  {
    id: "7",
    name: "All Verbs Mixed",
    description: "All transitive verbs combined",
    allowedDimensions: ["aspect", "actor", "object", "time"],
    requireObject: true,
    allowTime: true,
    aspects: ["completed", "ongoing", "contemplated"],
    pronouns: PRONOUN_KEYS,
    objects: [], // Dynamic per verb
    focusTypes: ["actor"],
    verbRoots: TRANSITIVE_VERB_ROOTS,
  },
];

export function getStage(id: string): Stage | undefined {
  return STAGES.find(s => s.id === id);
}

// Random utilities
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickExcept<T>(arr: T[], exclude: T): T {
  const filtered = arr.filter(x => x !== exclude);
  if (filtered.length === 0) return exclude;
  return pick(filtered);
}

// Fisher-Yates shuffle
function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Get objects valid for a specific verb
 */
function getObjectsForStageAndVerb(stage: Stage, verbRoot: string): string[] {
  // If stage has specific objects defined, use those
  if (stage.objects.length > 0) {
    return stage.objects;
  }
  // Otherwise, get compatible nouns for this verb
  return getNounsForVerb(verbRoot);
}

/**
 * Generate all possible states for a stage
 */
function allStatesForStage(stage: Stage): SentenceState[] {
  const states: SentenceState[] = [];

  for (const verbRoot of stage.verbRoots) {
    const objectsForVerb = getObjectsForStageAndVerb(stage, verbRoot);

    for (const focus of stage.focusTypes) {
      // Skip object focus for intransitive verbs
      if (focus === "object" && !isTransitive(verbRoot)) {
        continue;
      }

      for (const aspect of stage.aspects) {
        for (const actor of stage.pronouns) {
          const objects = stage.requireObject && objectsForVerb.length > 0 ? objectsForVerb : [undefined];

          for (const object of objects) {
            if (stage.allowTime) {
              // Include time variations - only compatible times for this aspect
              const compatibleTimes = TIME_KEYS.filter(t => isTimeCompatible(t, aspect));
              for (const time of compatibleTimes) {
                const state: SentenceState = { root: verbRoot, aspect, actor, focus };
                if (object) state.object = object;
                state.time = time;
                states.push(state);
              }
            } else {
              const state: SentenceState = { root: verbRoot, aspect, actor, focus };
              if (object) state.object = object;
              states.push(state);
            }
          }
        }
      }
    }
  }

  return states;
}

/**
 * Generate a random valid sentence state for a stage
 */
export function randomState(stage: Stage): SentenceState {
  // Pick a random verb root from the stage
  const verbRoot = pick(stage.verbRoots);
  const objectsForVerb = getObjectsForStageAndVerb(stage, verbRoot);

  // Pick focus, but exclude object focus for intransitive verbs
  let focusTypes = stage.focusTypes;
  if (!isTransitive(verbRoot)) {
    focusTypes = focusTypes.filter(f => f !== "object");
  }

  const state: SentenceState = {
    root: verbRoot,
    aspect: pick(stage.aspects),
    actor: pick(stage.pronouns),
    focus: pick(focusTypes),
  };

  if (stage.requireObject && objectsForVerb.length > 0) {
    state.object = pick(objectsForVerb);
  }

  if (stage.allowTime && Math.random() > 0.5) {
    // Pick a time compatible with the aspect
    const compatibleTimes = TIME_KEYS.filter(t => isTimeCompatible(t, state.aspect));
    if (compatibleTimes.length > 0) {
      state.time = pick(compatibleTimes);
    }
  }

  return state;
}

/**
 * Generate a state that differs from the given state by exactly one dimension
 */
export function nextState(current: SentenceState, stage: Stage): { state: SentenceState; diff: StateDiff } | null {
  // Pick a random dimension to change
  const dim = pick(stage.allowedDimensions);

  let newValue: string;
  switch (dim) {
    case "aspect":
      newValue = pickExcept(stage.aspects, current.aspect);
      break;
    case "actor":
      newValue = pickExcept(stage.pronouns, current.actor);
      break;
    case "object":
      if (!current.object || stage.objects.length === 0) {
        newValue = pick(stage.objects);
      } else {
        newValue = pickExcept(stage.objects, current.object);
      }
      break;
    case "time":
      const compatibleTimes = TIME_KEYS.filter(t => isTimeCompatible(t, current.aspect));
      if (compatibleTimes.length === 0) return null;
      newValue = current.time ? pickExcept(compatibleTimes, current.time) : pick(compatibleTimes);
      break;
    case "focus":
      newValue = pickExcept(stage.focusTypes, current.focus);
      break;
    default:
      return null;
  }

  const newState = transform(current, dim, newValue);

  // Validate the new state is natural
  if (!isValidState(newState)) {
    // Try again with different dimension
    return nextState(current, stage);
  }

  const diff = diffStates(current, newState);
  if (!diff) return null;

  return { state: newState, diff };
}

/**
 * Generate a sequence of exercises for a session
 * Uses even distribution: cycles through all possible states before repeating
 */
export function generateSession(
  stageId: string,
  repCount: number,
  modes: ExerciseMode[]
): Exercise[] {
  const stage = getStage(stageId);
  if (!stage) throw new Error(`Unknown stage: ${stageId}`);

  // Get all possible states and shuffle them
  const allStates = allStatesForStage(stage);

  // Build exercise list by cycling through shuffled states
  const exercises: Exercise[] = [];
  const modeDistribution = distributeReps(modes, repCount);

  // Track how many times each state has been used for even distribution
  let statePool = shuffle(allStates);
  let poolIndex = 0;

  for (let i = 0; i < repCount; i++) {
    // Refill and reshuffle pool when exhausted
    if (poolIndex >= statePool.length) {
      statePool = shuffle(allStates);
      poolIndex = 0;
    }

    const current = statePool[poolIndex];
    poolIndex++;

    const mode = modeDistribution[i];
    const rendered = render(current);

    exercises.push({
      mode,
      current,
      prompt: rendered.english,
    });
  }

  return exercises;
}

/**
 * Distribute exercise modes across reps
 * For V1, simple distribution: early exposure/notice, then predict/produce
 */
function distributeReps(modes: ExerciseMode[], total: number): ExerciseMode[] {
  if (modes.length === 1) {
    return Array(total).fill(modes[0]);
  }

  const result: ExerciseMode[] = [];
  const segments = modes.length;
  const perSegment = Math.floor(total / segments);

  for (let i = 0; i < segments; i++) {
    const count = (i === segments - 1) ? (total - result.length) : perSegment;
    for (let j = 0; j < count; j++) {
      result.push(modes[i]);
    }
  }

  return result;
}

/**
 * Check if user's answer matches the expected sentence
 * Normalizes whitespace and punctuation
 */
export function checkAnswer(userAnswer: string, expected: SentenceState): boolean {
  const rendered = render(expected);
  const normalize = (s: string) =>
    s.toLowerCase()
      .replace(/[.,!?]/g, "")
      .replace(/\s+/g, " ")
      .trim();

  return normalize(userAnswer) === normalize(rendered.tagalog);
}

/**
 * Get a hint for the current exercise
 */
export function getHint(exercise: Exercise): string {
  if (!exercise.diff) return "";

  switch (exercise.diff.dimension) {
    case "actor":
      return `Change the pronoun: ${exercise.diff.from} → ${exercise.diff.to}`;
    case "aspect":
      return `Change the verb form (timing)`;
    case "object":
      return `Change what is being eaten`;
    case "time":
      return `Change when it happens`;
    case "focus":
      return `Change the focus: ${exercise.diff.from} → ${exercise.diff.to}`;
    default:
      return "";
  }
}
