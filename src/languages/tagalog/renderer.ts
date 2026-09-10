// Tagalog sentence renderer
// Converts SentenceState to Tagalog string and English gloss

import type { SentenceState, Focus, Polarity, Mood } from "@/engine/types";
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
  dimension: "verb" | "actor" | "object" | "time" | "particle" | "negation" | "question";
  key?: string; // the underlying key (e.g., "ako", "mangga")
}

/**
 * Render a sentence state to Tagalog and English.
 *
 * Supports multiple patterns based on polarity and mood:
 *
 * AFFIRMATIVE STATEMENT (default):
 *   VERB + ACTOR + [ng OBJECT] [+ TIME]
 *   "Kumain ako ng isda."  (I ate fish.)
 *
 * NEGATIVE STATEMENT:
 *   Hindi + ACTOR + VERB + [ng OBJECT] [+ TIME]
 *   "Hindi ako kumain ng isda."  (I did not eat fish.)
 *
 * YES/NO QUESTION:
 *   VERB + ba + ACTOR + [ng OBJECT] [+ TIME]?
 *   "Kumain ka ba ng isda?"  (Did you eat fish?)
 *
 * WH QUESTION:
 *   QuestionWord + ang + VERB + ACTOR?  (for object questions)
 *   QuestionWord + ACTOR + VERB?        (for other questions)
 *   "Ano ang kinain mo?"  (What did you eat?)
 *   "Kailan ka kumain?"   (When did you eat?)
 */
export function render(state: SentenceState): RenderedSentence {
  const polarity: Polarity = state.polarity || "affirmative";
  const mood: Mood = state.mood || "statement";

  // Route to appropriate renderer
  if (mood === "wh_question" && state.questionWord) {
    return renderWhQuestion(state);
  } else if (mood === "yes_no") {
    return renderYesNoQuestion(state);
  } else if (polarity === "negative") {
    return renderNegative(state);
  } else {
    return renderAffirmative(state);
  }
}

/**
 * Render an affirmative statement (the original pattern)
 */
function renderAffirmative(state: SentenceState): RenderedSentence {
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

/**
 * Render a negative statement
 * Pattern: Hindi + ACTOR + VERB + [ng OBJECT] [+ TIME]
 * "Hindi ako kumain ng isda."
 */
function renderNegative(state: SentenceState): RenderedSentence {
  const parts: SentencePart[] = [];
  const focus: Focus = state.focus || "actor";

  // 1. Start with Hindi
  parts.push({ text: "Hindi", dimension: "negation", key: "hindi" });

  // 2. Actor/Agent form
  if (focus === "actor") {
    const actorForm = getActorForm(state.actor);
    parts.push({ text: actorForm, dimension: "actor", key: state.actor });
  } else {
    const agentForm = getAgentForm(state.actor);
    parts.push({ text: agentForm, dimension: "actor", key: state.actor });
  }

  // 3. Verb (lowercase since not at start)
  const verbForm = getVerbForm(state.root, state.aspect as Aspect, focus as FocusType);
  if (!verbForm) {
    throw new Error(`Unknown verb: ${state.root}, ${state.aspect}, ${focus}`);
  }
  parts.push({ text: verbForm, dimension: "verb", key: state.root });

  // 4. Object
  if (state.object) {
    if (focus === "actor") {
      parts.push({ text: "ng", dimension: "particle" });
    } else {
      parts.push({ text: "ang", dimension: "particle" });
    }
    parts.push({ text: getNounTagalog(state.object), dimension: "object", key: state.object });
  }

  // 5. Time
  if (state.time) {
    parts.push({ text: getTimeTagalog(state.time), dimension: "time", key: state.time });
  }

  const tagalog = parts.map(p => p.text).join(" ") + ".";
  const english = renderEnglishNegative(state);

  return { tagalog, english, parts };
}

/**
 * Render a yes/no question
 * Pattern: VERB + ba + ACTOR + [ng OBJECT] [+ TIME]?
 * "Kumain ka ba ng isda?"
 */
function renderYesNoQuestion(state: SentenceState): RenderedSentence {
  const parts: SentencePart[] = [];
  const focus: Focus = state.focus || "actor";
  const polarity: Polarity = state.polarity || "affirmative";

  // Handle negative yes/no questions: "Hindi ka ba kumain?"
  if (polarity === "negative") {
    parts.push({ text: "Hindi", dimension: "negation", key: "hindi" });

    if (focus === "actor") {
      parts.push({ text: getActorForm(state.actor), dimension: "actor", key: state.actor });
    } else {
      parts.push({ text: getAgentForm(state.actor), dimension: "actor", key: state.actor });
    }

    parts.push({ text: "ba", dimension: "question", key: "ba" });

    const verbForm = getVerbForm(state.root, state.aspect as Aspect, focus as FocusType)!;
    parts.push({ text: verbForm, dimension: "verb", key: state.root });
  } else {
    // Affirmative yes/no: "Kumain ka ba?"
    const verbForm = getVerbForm(state.root, state.aspect as Aspect, focus as FocusType);
    if (!verbForm) {
      throw new Error(`Unknown verb: ${state.root}, ${state.aspect}, ${focus}`);
    }
    const capitalizedVerb = verbForm.charAt(0).toUpperCase() + verbForm.slice(1);
    parts.push({ text: capitalizedVerb, dimension: "verb", key: state.root });

    if (focus === "actor") {
      parts.push({ text: getActorForm(state.actor), dimension: "actor", key: state.actor });
    } else {
      parts.push({ text: getAgentForm(state.actor), dimension: "actor", key: state.actor });
    }

    parts.push({ text: "ba", dimension: "question", key: "ba" });
  }

  // Object
  if (state.object) {
    if (focus === "actor") {
      parts.push({ text: "ng", dimension: "particle" });
    } else {
      parts.push({ text: "ang", dimension: "particle" });
    }
    parts.push({ text: getNounTagalog(state.object), dimension: "object", key: state.object });
  }

  // Time
  if (state.time) {
    parts.push({ text: getTimeTagalog(state.time), dimension: "time", key: state.time });
  }

  const tagalog = parts.map(p => p.text).join(" ") + "?";
  const english = renderEnglishYesNo(state);

  return { tagalog, english, parts };
}

/**
 * Render a WH question
 * Pattern depends on question word and what's being asked
 *
 * Object questions (ano): "Ano ang kinain mo?" (What did you eat?)
 * Time questions (kailan): "Kailan ka kumain?" (When did you eat?)
 * Reason questions (bakit): "Bakit ka kumain?" (Why did you eat?)
 * Location questions (saan): "Saan ka kumain?" (Where did you eat?)
 */
function renderWhQuestion(state: SentenceState): RenderedSentence {
  const parts: SentencePart[] = [];
  const focus: Focus = state.focus || "actor";
  const qWord = state.questionWord!;

  // Question word (capitalized)
  const qWordCapitalized = qWord.charAt(0).toUpperCase() + qWord.slice(1);
  parts.push({ text: qWordCapitalized, dimension: "question", key: qWord });

  if (qWord === "ano") {
    // "Ano ang kinain mo?" - asking about the object
    // Always use object-focus verb form
    const verbForm = getVerbForm(state.root, state.aspect as Aspect, "object");
    if (!verbForm) {
      throw new Error(`Unknown verb: ${state.root}, ${state.aspect}, object`);
    }
    parts.push({ text: "ang", dimension: "particle" });
    parts.push({ text: verbForm, dimension: "verb", key: state.root });
    parts.push({ text: getAgentForm(state.actor), dimension: "actor", key: state.actor });
  } else if (qWord === "sino") {
    // "Sino ang kumain ng isda?" - asking about the actor
    parts.push({ text: "ang", dimension: "particle" });
    const verbForm = getVerbForm(state.root, state.aspect as Aspect, "actor")!;
    parts.push({ text: verbForm, dimension: "verb", key: state.root });
    if (state.object) {
      parts.push({ text: "ng", dimension: "particle" });
      parts.push({ text: getNounTagalog(state.object), dimension: "object", key: state.object });
    }
  } else {
    // kailan, bakit, saan, paano - asking about circumstances
    // "Kailan ka kumain?" / "Bakit ka kumain?"
    if (focus === "actor") {
      parts.push({ text: getActorForm(state.actor), dimension: "actor", key: state.actor });
    } else {
      parts.push({ text: getAgentForm(state.actor), dimension: "actor", key: state.actor });
    }

    const verbForm = getVerbForm(state.root, state.aspect as Aspect, focus as FocusType)!;
    parts.push({ text: verbForm, dimension: "verb", key: state.root });

    if (state.object) {
      if (focus === "actor") {
        parts.push({ text: "ng", dimension: "particle" });
      } else {
        parts.push({ text: "ang", dimension: "particle" });
      }
      parts.push({ text: getNounTagalog(state.object), dimension: "object", key: state.object });
    }
  }

  // Time (only if not asking about time)
  if (state.time && qWord !== "kailan") {
    parts.push({ text: getTimeTagalog(state.time), dimension: "time", key: state.time });
  }

  const tagalog = parts.map(p => p.text).join(" ") + "?";
  const english = renderEnglishWh(state);

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

function renderEnglishNegative(state: SentenceState): string {
  const subject = getEnglishSubject(state.actor);
  const aspect = state.aspect as Aspect;

  let subjectStr = subject;
  if (state.actor === "kami") subjectStr = "we (not you)";
  else if (state.actor === "tayo") subjectStr = "we (including you)";

  const objectStr = state.object ? getNounEnglish(state.object) : "";
  let verbPhrase: string;

  switch (aspect) {
    case "completed":
      verbPhrase = objectStr ? `did not eat ${objectStr}` : "did not eat";
      break;
    case "ongoing":
      const isPlural = PRONOUNS[state.actor]?.plural;
      const be = (state.actor === "ako") ? "am" : (isPlural ? "are" : "is");
      verbPhrase = objectStr ? `${be} not eating ${objectStr}` : `${be} not eating`;
      break;
    case "contemplated":
      verbPhrase = objectStr ? `will not eat ${objectStr}` : "will not eat";
      break;
    default:
      verbPhrase = "do not eat";
  }

  const timeStr = state.time ? ` ${getTimeEnglish(state.time)}` : "";
  const sentence = `${subjectStr} ${verbPhrase}${timeStr}.`;
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
}

function renderEnglishYesNo(state: SentenceState): string {
  const subject = getEnglishSubject(state.actor);
  const aspect = state.aspect as Aspect;
  const polarity = state.polarity || "affirmative";

  let subjectStr = subject;
  if (state.actor === "kami") subjectStr = "we (not you)";
  else if (state.actor === "tayo") subjectStr = "we (including you)";

  const objectStr = state.object ? ` ${getNounEnglish(state.object)}` : "";
  const timeStr = state.time ? ` ${getTimeEnglish(state.time)}` : "";
  const negStr = polarity === "negative" ? "not " : "";

  let question: string;
  switch (aspect) {
    case "completed":
      question = `Did ${subjectStr} ${negStr}eat${objectStr}${timeStr}?`;
      break;
    case "ongoing":
      const isPlural = PRONOUNS[state.actor]?.plural;
      const be = (state.actor === "ako") ? "Am" : (isPlural ? "Are" : "Is");
      question = `${be} ${subjectStr} ${negStr}eating${objectStr}${timeStr}?`;
      break;
    case "contemplated":
      question = `Will ${subjectStr} ${negStr}eat${objectStr}${timeStr}?`;
      break;
    default:
      question = `Does ${subjectStr} ${negStr}eat${objectStr}${timeStr}?`;
  }

  return question.charAt(0).toUpperCase() + question.slice(1);
}

function renderEnglishWh(state: SentenceState): string {
  const subject = getEnglishSubject(state.actor);
  const aspect = state.aspect as Aspect;
  const qWord = state.questionWord!;

  let subjectStr = subject;
  if (state.actor === "kami") subjectStr = "we (not you)";
  else if (state.actor === "tayo") subjectStr = "we (including you)";

  const objectStr = state.object ? ` ${getNounEnglish(state.object)}` : "";
  const timeStr = state.time ? ` ${getTimeEnglish(state.time)}` : "";

  // Map question words to English
  const qWordMap: Record<string, string> = {
    ano: "What",
    sino: "Who",
    saan: "Where",
    kailan: "When",
    bakit: "Why",
    paano: "How",
  };
  const engQWord = qWordMap[qWord] || qWord;

  let question: string;

  if (qWord === "ano") {
    // Asking about object
    switch (aspect) {
      case "completed":
        question = `${engQWord} did ${subjectStr} eat${timeStr}?`;
        break;
      case "ongoing":
        const isPlural = PRONOUNS[state.actor]?.plural;
        const be = (state.actor === "ako") ? "am" : (isPlural ? "are" : "is");
        question = `${engQWord} ${be} ${subjectStr} eating${timeStr}?`;
        break;
      case "contemplated":
        question = `${engQWord} will ${subjectStr} eat${timeStr}?`;
        break;
      default:
        question = `${engQWord} does ${subjectStr} eat${timeStr}?`;
    }
  } else if (qWord === "sino") {
    // Asking about actor
    switch (aspect) {
      case "completed":
        question = `${engQWord} ate${objectStr}${timeStr}?`;
        break;
      case "ongoing":
        question = `${engQWord} is eating${objectStr}${timeStr}?`;
        break;
      case "contemplated":
        question = `${engQWord} will eat${objectStr}${timeStr}?`;
        break;
      default:
        question = `${engQWord} eats${objectStr}${timeStr}?`;
    }
  } else {
    // kailan, bakit, saan, paano
    switch (aspect) {
      case "completed":
        question = `${engQWord} did ${subjectStr} eat${objectStr}?`;
        break;
      case "ongoing":
        const isPlural = PRONOUNS[state.actor]?.plural;
        const be = (state.actor === "ako") ? "am" : (isPlural ? "are" : "is");
        question = `${engQWord} ${be} ${subjectStr} eating${objectStr}?`;
        break;
      case "contemplated":
        question = `${engQWord} will ${subjectStr} eat${objectStr}?`;
        break;
      default:
        question = `${engQWord} does ${subjectStr} eat${objectStr}?`;
    }
  }

  return question;
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
