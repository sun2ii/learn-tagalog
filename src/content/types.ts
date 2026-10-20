// Content model. Everything the app renders comes from these shapes.

export type Role =
  | "action" // verbs
  | "person" // pronouns, names, people
  | "thing" // nouns, food, places used as nouns
  | "particle" // ang / ng / sa / na / pa / ba / lang / po ...
  | "question" // ano / saan / sino ...
  | "describe" // adjectives, adverbs
  | "time"; // time & place expressions

export type AnchorLang = "id" | "es" | "en";

export interface Anchor {
  lang: AnchorLang;
  word: string; // the related word in that language
  note?: string; // "same meaning" / "meaning shifted: ..."
}

/* ----------------------------------------------------------------
   MORPHOLOGY SYSTEM
   ----------------------------------------------------------------
   Tagalog builds words through affixation. Instead of prose notes like
   "nag- + handa: root 'handa' (prepare)", we decompose words into parts
   that reference reusable patterns.

   A MorphPart is one piece of a word:
   - "root"    → the base meaning (e.g., "kain" = eat)
   - "prefix"  → attached before (e.g., "nag-", "ma-", "naka-")
   - "infix"   → inserted inside (e.g., "-um-", "-in-")
   - "suffix"  → attached after (e.g., "-an", "-in", "-han")
   - "redup"   → reduplication (e.g., "ka" in "kakain")

   Each part can reference a pattern key for the reusable explanation,
   or provide a one-off gloss.
---------------------------------------------------------------- */

export type MorphPartType = "root" | "prefix" | "infix" | "suffix" | "redup";

export interface MorphPart {
  type: MorphPartType;
  text: string;           // the actual characters: "nag", "um", "kain"
  gloss?: string;         // meaning of THIS part in THIS word (optional if pattern explains it)
  pattern?: string;       // key into MORPH_PATTERNS for reusable explanation
}

export interface Morphology {
  parts: MorphPart[];     // ordered decomposition of the word
  label?: string;         // optional short label like "Actor Focus, Completed"
}

/* A morphology pattern is a reusable explanation for an affix or process. */
export interface MorphPattern {
  form: string;           // display form: "nag-", "-um-", "ma-", "CV~"
  type: MorphPartType;
  name: string;           // short name: "actor focus", "stative", etc.
  meaning: string;        // what this pattern contributes
  examples?: string[];    // e.g., ["nagluto", "naglakad", "nagbayad"]
}

export interface Token {
  t: string; // surface text as spoken
  role: Role;
  m: string; // meaning in this sentence
  root?: string; // dictionary root if inflected (kumain -> kain)
  note?: string; // mechanism note shown on tap (legacy, prefer morphology)
  anchor?: Anchor;
  aspect?: "contemplated" | "ongoing" | "completed"; // verbs only: 0 · ½ · 1
  morph?: Morphology; // structured decomposition
}

export interface Line {
  id: string; // stable id, used for audio file name
  speaker: "A" | "B";
  text: string; // full Tagalog line (what is spoken)
  gloss: string; // natural English
  tokens: Token[];
  yours?: boolean; // the line you practise saying
}

export interface SituationQuiz {
  prompt: string;
  options: string[];
  answer: number; // index into options
  why: string; // the cue that gives it away
}

export interface Exchange {
  id: string;
  situation: string; // one-line scene setting shown before listening
  lines: Line[];
  quiz: SituationQuiz;
  variation: Line; // same pieces, new sentence – heard after the reveal
  takeaway: string; // the one thing this exchange teaches
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  exchanges: Exchange[];
}

export const ROLE_LABEL: Record<Role, string> = {
  action: "action",
  person: "person",
  thing: "thing",
  particle: "particle",
  question: "question",
  describe: "describe",
  time: "time / place",
};
