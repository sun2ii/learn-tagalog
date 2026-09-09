// Tagalog sentence renderer
// Converts SentenceState to Tagalog string and English gloss

import type { SentenceState, Focus } from "@/engine/types";
import type { Aspect, FocusType } from "./verbs";
import { getVerbForm, ASPECT_ENGLISH } from "./verbs";
import { getActorForm, getAgentForm, getEnglishSubject, PRONOUNS } from "./pronouns";
import { getNounTagalog, getNounEnglish } from "./nouns";
import { getTimeTagalog, getTimeEnglish, TIME_EXPRESSIONS } from "./time";

export interface RenderedSentence {
  tagalog: string;
  english: string;
  parts: SentencePart[];
}

export interface SentencePart {
  text: string;
  dimension: "verb" | "actor" | "object" | "time" | "particle";
  key?: string; // the underlying key (e.g., "ako", "mangga")
}

/**
 * Render a sentence state to Tagalog and English.
 *
 * ACTOR-FOCUS pattern (state.focus === "actor"):
 *   VERB + ACTOR(ang) + ng + OBJECT [+ TIME]
 *   "Kumain ako ng isda."  (I ate fish.)
 *
 * OBJECT-FOCUS pattern (state.focus === "object"):
 *   VERB + AGENT(ng) + ang + OBJECT [+ TIME]
 *   "Kinain ko ang isda."  (I ate the fish. / The fish was eaten by me.)
 */
export function render(state: SentenceState): RenderedSentence {
  const parts: SentencePart[] = [];
  const focus: Focus = state.focus || "actor";

  // 1. Verb form based on aspect AND focus
  const verbForm = getVerbForm(state.root, state.aspect as Aspect, focus as FocusType);
  if (!verbForm) {
    throw new Error(`Unknown verb root, aspect, or focus: ${state.root}, ${state.aspect}, ${focus}`);
  }

  // Capitalize first letter
  const capitalizedVerb = verbForm.charAt(0).toUpperCase() + verbForm.slice(1);
  parts.push({ text: capitalizedVerb, dimension: "verb", key: state.root });

  if (focus === "actor") {
    // ACTOR-FOCUS: VERB + actor(ang) + ng + object
    const actorForm = getActorForm(state.actor);
    parts.push({ text: actorForm, dimension: "actor", key: state.actor });

    if (state.object) {
      parts.push({ text: "ng", dimension: "particle" });
      parts.push({ text: getNounTagalog(state.object), dimension: "object", key: state.object });
    }
  } else {
    // OBJECT-FOCUS: VERB + agent(ng) + ang + object
    // Object is required for object-focus sentences
    const agentForm = getAgentForm(state.actor);
    parts.push({ text: agentForm, dimension: "actor", key: state.actor });

    if (state.object) {
      parts.push({ text: "ang", dimension: "particle" });
      parts.push({ text: getNounTagalog(state.object), dimension: "object", key: state.object });
    }
  }

  // Time (if present)
  if (state.time) {
    parts.push({ text: getTimeTagalog(state.time), dimension: "time", key: state.time });
  }

  // Build Tagalog string
  const tagalog = parts.map(p => p.text).join(" ") + ".";

  // Build English gloss
  const english = renderEnglish(state);

  return { tagalog, english, parts };
}

function renderEnglish(state: SentenceState): string {
  const subject = getEnglishSubject(state.actor);
  const aspect = state.aspect as Aspect;

  // Handle "we" distinction
  let subjectStr = subject;
  if (state.actor === "kami") {
    subjectStr = "we (not you)";
  } else if (state.actor === "tayo") {
    subjectStr = "we (including you)";
  }

  // Build verb phrase based on aspect
  let verbPhrase: string;
  const objectStr = state.object ? getNounEnglish(state.object) : "";

  switch (aspect) {
    case "completed":
      verbPhrase = objectStr ? `ate ${objectStr}` : "ate";
      break;
    case "ongoing":
      // Handle singular/plural for "is/are eating"
      const isPlural = PRONOUNS[state.actor]?.plural;
      const be = (state.actor === "ako") ? "am" : (isPlural ? "are" : "is");
      verbPhrase = objectStr ? `${be} eating ${objectStr}` : `${be} eating`;
      break;
    case "contemplated":
      verbPhrase = objectStr ? `will eat ${objectStr}` : "will eat";
      break;
    default:
      verbPhrase = "eat";
  }

  // Add time if present
  const timeStr = state.time ? ` ${getTimeEnglish(state.time)}` : "";

  // Capitalize and punctuate
  const sentence = `${subjectStr} ${verbPhrase}${timeStr}.`;
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

/**
 * Check if a state represents a valid, natural Tagalog sentence.
 */
export function isValidState(state: SentenceState): boolean {
  const focus: Focus = state.focus || "actor";

  // Check verb exists for this focus type
  const verbForm = getVerbForm(state.root, state.aspect as Aspect, focus as FocusType);
  if (!verbForm) return false;

  // Check pronoun exists
  if (!PRONOUNS[state.actor]) return false;

  // Object-focus requires an object
  if (focus === "object" && !state.object) return false;

  // If time is specified, check compatibility with aspect
  if (state.time) {
    const timeEntry = TIME_EXPRESSIONS[state.time];
    if (!timeEntry) return false;
    if (!timeEntry.compatibleAspects.includes(state.aspect as "completed" | "ongoing" | "contemplated")) return false;
  }

  return true;
}
