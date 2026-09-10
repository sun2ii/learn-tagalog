// Curriculum unlock logic: determines what the learner can access

import type { LearnerState, ConceptProgress } from "./types";
import { CURRICULUM, getConcept } from "./index";

/**
 * Check if a concept is unlocked for the learner.
 * A concept is unlocked if all prerequisites are mastered.
 * The first concept (actor) is always unlocked.
 */
export function isConceptUnlocked(state: LearnerState, conceptId: string): boolean {
  const concept = getConcept(conceptId);
  if (!concept) return false;

  // First concept is always unlocked
  if (concept.prerequisites.length === 0) return true;

  // Check all prerequisites are mastered
  return concept.prerequisites.every(prereqId => {
    const progress = state.concepts[prereqId];
    return progress?.mastered === true;
  });
}

/**
 * Get all currently unlocked concepts for the learner.
 */
export function getUnlockedConcepts(state: LearnerState): string[] {
  return CURRICULUM
    .filter(c => isConceptUnlocked(state, c.id))
    .map(c => c.id);
}

/**
 * Get the current concept the learner is working on.
 * This is the first unlocked but not-yet-mastered concept.
 */
export function getCurrentConcept(state: LearnerState): string | null {
  for (const concept of CURRICULUM) {
    if (!isConceptUnlocked(state, concept.id)) continue;
    const progress = state.concepts[concept.id];
    if (!progress?.mastered) return concept.id;
  }
  // All concepts mastered
  return null;
}

/**
 * Get the highest mastered concept.
 */
export function getHighestMasteredConcept(state: LearnerState): string | null {
  let highest: string | null = null;
  for (const concept of CURRICULUM) {
    const progress = state.concepts[concept.id];
    if (progress?.mastered) {
      highest = concept.id;
    }
  }
  return highest;
}

/**
 * Calculate mastery for a concept based on attempts.
 */
export function calculateMastery(progress: ConceptProgress, threshold: number): boolean {
  if (progress.attempts < 5) return false; // Minimum attempts
  const accuracy = progress.correct / progress.attempts;
  return accuracy >= threshold;
}

/**
 * Record an attempt on a concept and update mastery status.
 */
export function recordAttempt(
  state: LearnerState,
  conceptId: string,
  correct: boolean
): LearnerState {
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
    mastered: existing.mastered, // Will recalculate below
  };

  // Recalculate mastery
  updated.mastered = calculateMastery(updated, concept.masteryThreshold);

  return {
    ...state,
    concepts: {
      ...state.concepts,
      [conceptId]: updated,
    },
  };
}

/**
 * Get progress summary for display.
 */
export function getProgressSummary(state: LearnerState): {
  totalConcepts: number;
  masteredConcepts: number;
  currentConcept: string | null;
  percentComplete: number;
} {
  const mastered = CURRICULUM.filter(c => state.concepts[c.id]?.mastered).length;
  return {
    totalConcepts: CURRICULUM.length,
    masteredConcepts: mastered,
    currentConcept: getCurrentConcept(state),
    percentComplete: Math.round((mastered / CURRICULUM.length) * 100),
  };
}
