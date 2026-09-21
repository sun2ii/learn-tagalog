"use client";
// "What should I practice next?" – one lookup, no engine.
// The curriculum is a ladder; the current concept picks the workout.

import { getCurrentConcept } from "@/curriculum/unlock";
import { getLearnerState } from "@/lib/learner";
import { CURRICULUM, getConcept } from "@/curriculum";
import { WORKOUTS, type Workout } from "@/lib/exercises";

const WORKOUT_FOR_CONCEPT: Record<string, string> = {
  actor: "actor", aspect: "actor", object: "actor", time: "actor",
  focus: "focus", negation: "negation", "yes-no": "yesno", "wh-questions": "wh",
  combination: "mix", connectors: "mix",
};

export function recommendedWorkout(): { workout: Workout; conceptName: string; conceptId: string } {
  const state = getLearnerState();
  const id = getCurrentConcept(state) ?? CURRICULUM[CURRICULUM.length - 1].id;
  const workout = WORKOUTS.find((w) => w.id === WORKOUT_FOR_CONCEPT[id]) ?? WORKOUTS[0];
  return { workout, conceptName: getConcept(id)?.name ?? "", conceptId: id };
}
