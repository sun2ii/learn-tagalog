// Diff two sentence states to find what changed

import type { SentenceState, StateDiff, Dimension } from "./types";

const DIMENSIONS: Dimension[] = ["aspect", "actor", "object", "time"];

export function diffStates(a: SentenceState, b: SentenceState): StateDiff | null {
  if (a.root !== b.root) {
    // Root change is a different verb entirely, not a single-dimension transform
    return null;
  }

  const diffs: StateDiff[] = [];

  for (const dim of DIMENSIONS) {
    const valA = a[dim];
    const valB = b[dim];
    if (valA !== valB) {
      diffs.push({ dimension: dim, from: valA ?? "", to: valB ?? "" });
    }
  }

  // We only return a diff if exactly one dimension changed
  if (diffs.length === 1) {
    return diffs[0];
  }

  return null;
}

export function statesEqual(a: SentenceState, b: SentenceState): boolean {
  return (
    a.root === b.root &&
    a.aspect === b.aspect &&
    a.actor === b.actor &&
    a.object === b.object &&
    a.time === b.time
  );
}

export function stateKey(s: SentenceState): string {
  return `${s.root}:${s.aspect}:${s.actor}:${s.object ?? ""}:${s.time ?? ""}`;
}
