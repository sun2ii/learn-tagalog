// Transform a sentence state by changing exactly one dimension

import type { SentenceState, Dimension } from "./types";

export function transform(
  state: SentenceState,
  dimension: Dimension,
  newValue: string
): SentenceState {
  return {
    ...state,
    [dimension]: newValue,
  };
}

export function withAspect(state: SentenceState, aspect: string): SentenceState {
  return { ...state, aspect };
}

export function withActor(state: SentenceState, actor: string): SentenceState {
  return { ...state, actor };
}

export function withObject(state: SentenceState, object: string): SentenceState {
  return { ...state, object };
}

export function withTime(state: SentenceState, time: string | undefined): SentenceState {
  return { ...state, time };
}
