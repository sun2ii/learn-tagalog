// Tagalog verb data: roots and their aspect forms
// Architecture supports multiple verbs with different morphology patterns.

export type Aspect = "completed" | "ongoing" | "contemplated";
export type FocusType = "actor" | "object";

export interface VerbForms {
  completed: string;
  ongoing: string;
  contemplated: string;
}

export interface VerbEntry {
  root: string;
  meaning: string;
  actorFocus: VerbForms;      // Actor is the topic (ang)
  objectFocus?: VerbForms;    // Object/patient is the topic (ang)
}

export const VERBS: Record<string, VerbEntry> = {
  kain: {
    root: "kain",
    meaning: "eat",
    actorFocus: {
      completed: "kumain",      // k-um-ain
      ongoing: "kumakain",      // k-um-a-kain (with reduplication)
      contemplated: "kakain",   // ka-kain (CV reduplication)
    },
    objectFocus: {
      completed: "kinain",      // k-in-ain
      ongoing: "kinakain",      // k-in-a-kain
      contemplated: "kakainin", // ka-kain-in
    },
  },
};

export const ASPECT_ENGLISH: Record<Aspect, string> = {
  completed: "ate",
  ongoing: "is eating",
  contemplated: "will eat",
};

export function getVerbForm(root: string, aspect: Aspect, focus: FocusType = "actor"): string | undefined {
  const verb = VERBS[root];
  if (!verb) return undefined;

  if (focus === "object") {
    return verb.objectFocus?.[aspect];
  }
  return verb.actorFocus[aspect];
}

export function getVerbMeaning(root: string): string | undefined {
  return VERBS[root]?.meaning;
}
