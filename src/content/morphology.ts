// Morphology patterns: reusable explanations for Tagalog affixes and processes.
// These are referenced by pattern key in Token.morph.parts[].pattern

import type { MorphPattern } from "./types";

/* ----------------------------------------------------------------
   TAGALOG MORPHOLOGY OVERVIEW

   Tagalog verbs mark:
   - FOCUS: which noun is the topic (actor, object, location, etc.)
   - ASPECT: timing (not yet / ongoing / completed)

   Focus types:
   - Actor Focus (AF): the doer is the topic → mag-, -um-
   - Object Focus (OF): the thing done to is the topic → -in, i-
   - Locative Focus (LF): the place is the topic → -an
   - Benefactive Focus (BF): the beneficiary is the topic → i- ... -an

   Aspect (applies to all focus types):
   - Contemplated: will happen / not yet → reduplication of first CV
   - Ongoing: happening now → reduplication + infix changes
   - Completed: already done → base form

   Adjectives use:
   - ma-: stative ("having the quality of")
   - maganda, maliit, masaya

   Other patterns:
   - naka-: stative result ("in the state of having done X")
   - pala-: habitual / inclined toward
   - ka-...-an: abstract nouns / place nouns
   - pag-: verbal noun (the act of doing X)
   - maN-: actor focus with nasal assimilation
---------------------------------------------------------------- */

export const MORPH_PATTERNS: Record<string, MorphPattern> = {
  // ============================================================
  // ACTOR FOCUS (AF) PATTERNS
  // ============================================================

  "mag-": {
    form: "mag-",
    type: "prefix",
    name: "actor focus",
    meaning: "The doer is the topic. Often for deliberate, volitional actions.",
    examples: ["magluto", "maglakad", "magbayad", "magtrabaho"],
  },

  "nag-": {
    form: "nag-",
    type: "prefix",
    name: "actor focus, completed",
    meaning: "The doer did something (completed). From mag- → nag-.",
    examples: ["nagluto", "naglakad", "nagbayad", "naghanda"],
  },

  "nagC~": {
    form: "nag-C~",
    type: "prefix",
    name: "actor focus, ongoing",
    meaning: "The doer is doing something right now. Reduplication of first consonant+vowel.",
    examples: ["nagluluto", "naglalakad", "nagbabayad"],
  },

  "magC~": {
    form: "mag-C~",
    type: "prefix",
    name: "actor focus, contemplated",
    meaning: "The doer will do / intends to do. Reduplication signals 'not yet'.",
    examples: ["magluluto", "maglalakad", "magbabayad"],
  },

  "-um-": {
    form: "-um-",
    type: "infix",
    name: "actor focus",
    meaning: "The doer is the topic. For many common, everyday actions.",
    examples: ["kumain", "pumunta", "tumawa", "lumakad"],
  },

  "C-um-": {
    form: "-um-",
    type: "infix",
    name: "actor focus, completed",
    meaning: "The doer did something. The -um- is inserted after the first consonant.",
    examples: ["kumain", "pumunta", "sumakay", "tumawa"],
  },

  "C-um-C~": {
    form: "-um- + CV~",
    type: "infix",
    name: "actor focus, ongoing",
    meaning: "The doer is doing something now. -um- plus reduplication.",
    examples: ["kumakain", "pumupunta", "tumatawa"],
  },

  "C~-um-": {
    form: "CV~ + -um-",
    type: "infix",
    name: "actor focus, contemplated",
    meaning: "The doer will do something. Reduplication comes first.",
    examples: ["kakain", "pupunta", "tatawa"],
  },

  "maN-": {
    form: "maN-",
    type: "prefix",
    name: "actor focus (nasal)",
    meaning: "Actor focus with nasal assimilation. The N changes based on the root's first sound.",
    examples: ["manood", "mamili", "mangisda"],
  },

  "naN-": {
    form: "naN-",
    type: "prefix",
    name: "actor focus (nasal), completed",
    meaning: "Completed form of maN-. The N assimilates to the root.",
    examples: ["nanood", "namili", "nangisda"],
  },

  // ============================================================
  // OBJECT FOCUS (OF) PATTERNS
  // ============================================================

  "-in": {
    form: "-in",
    type: "suffix",
    name: "object focus",
    meaning: "The thing being acted upon is the topic.",
    examples: ["kainin", "bilhin", "kunin"],
  },

  "-in-": {
    form: "-in-",
    type: "infix",
    name: "object focus, completed",
    meaning: "The object was acted upon (completed). Infix after first consonant.",
    examples: ["kinain", "binili", "kinuha"],
  },

  "C-in-C~": {
    form: "-in- + CV~",
    type: "infix",
    name: "object focus, ongoing",
    meaning: "The object is being acted upon right now.",
    examples: ["kinakain", "binibili", "kinukuha"],
  },

  "i-": {
    form: "i-",
    type: "prefix",
    name: "object focus / instrumental",
    meaning: "The object or instrument is the topic. Often for 'put/place' or 'use'.",
    examples: ["ilagay", "ibigay", "itapon", "iluto"],
  },

  // ============================================================
  // LOCATIVE FOCUS (LF) PATTERNS
  // ============================================================

  "-an": {
    form: "-an",
    type: "suffix",
    name: "locative focus / place",
    meaning: "The location or direction is the topic. Also forms place nouns.",
    examples: ["puntahan", "bilhan", "tirahan", "bahayan"],
  },

  "-han": {
    form: "-han",
    type: "suffix",
    name: "locative focus",
    meaning: "Variant of -an after certain roots. Location is the topic.",
    examples: ["lagyan", "sulatan", "bayaran"],
  },

  // ============================================================
  // STATIVE / DESCRIPTIVE PATTERNS
  // ============================================================

  "ma-": {
    form: "ma-",
    type: "prefix",
    name: "stative / quality",
    meaning: "Having the quality of. Forms adjectives from roots.",
    examples: ["maganda", "maliit", "masaya", "mabait", "mausisa"],
  },

  "naka-": {
    form: "naka-",
    type: "prefix",
    name: "stative result",
    meaning: "In the state of having done X. A completed action's result as a state.",
    examples: ["nakatira", "nakaupo", "nakangiti", "nakapasok"],
  },

  "nakaka-": {
    form: "nakaka-",
    type: "prefix",
    name: "able to cause",
    meaning: "Causes a feeling or state. 'Makes one feel X.'",
    examples: ["nakakatawa", "nakakagutom", "nakakatuwa", "nakakahiya"],
  },

  "maka-": {
    form: "maka-",
    type: "prefix",
    name: "abilitative",
    meaning: "Able to do, capable of doing.",
    examples: ["makakain", "makapunta", "makakita"],
  },

  // ============================================================
  // NOMINAL / DERIVATIONAL PATTERNS
  // ============================================================

  "pag-": {
    form: "pag-",
    type: "prefix",
    name: "verbal noun",
    meaning: "The act of doing X. Turns a verb into a noun.",
    examples: ["pagkain", "pagluto", "pagtingin", "paghahanap"],
  },

  "pagC~": {
    form: "pag- + CV~",
    type: "prefix",
    name: "verbal noun (ongoing/habitual)",
    meaning: "The act of doing X, often ongoing or habitual.",
    examples: ["pagluluto", "paglalakad", "paghahanap"],
  },

  "ka-": {
    form: "ka-",
    type: "prefix",
    name: "companion / abstract",
    meaning: "Fellow, companion, or abstract quality.",
    examples: ["kaibigan", "kasama", "kagandahan"],
  },

  "ka-...-an": {
    form: "ka-...-an",
    type: "prefix", // circumfix, but we model as prefix for simplicity
    name: "abstract noun / place",
    meaning: "Abstract quality or place associated with the root.",
    examples: ["kahuyan", "kagandahan", "kalayuan", "kasamaan"],
  },

  "pala-": {
    form: "pala-",
    type: "prefix",
    name: "habitual / inclined",
    meaning: "One who habitually does or is inclined toward X.",
    examples: ["palakain", "palabiro", "palakaibigan", "palaisipan"],
  },

  "maN-...-an": {
    form: "maN-...-an",
    type: "prefix",
    name: "reciprocal / manner",
    meaning: "Doing something reciprocally or in a particular manner.",
    examples: ["mambati", "manggulo"],
  },

  "pan-": {
    form: "pan-",
    type: "prefix",
    name: "instrumental / purpose",
    meaning: "For the purpose of, instrument for doing X.",
    examples: ["pansayaw", "panulat", "panturo", "panggabi"],
  },

  "taga-": {
    form: "taga-",
    type: "prefix",
    name: "origin / role",
    meaning: "Person from (place) or person who does (role).",
    examples: ["tagaluto", "tagabayan", "tagamaynila"],
  },

  "mag-...-an": {
    form: "mag-...-an",
    type: "prefix",
    name: "reciprocal",
    meaning: "Doing something to each other.",
    examples: ["magtawanan", "maghabulan", "magsayawan"],
  },

  // ============================================================
  // ASPECT MARKERS (as reduplication)
  // ============================================================

  "CV~": {
    form: "CV~",
    type: "redup",
    name: "reduplication",
    meaning: "Copying the first consonant+vowel. Signals contemplated (not yet) or ongoing aspect.",
    examples: ["kakain", "pupunta", "kumakain"],
  },

  "CV~-ongoing": {
    form: "CV~",
    type: "redup",
    name: "ongoing marker",
    meaning: "Reduplication signaling the action is happening now.",
    examples: ["kumakain", "nagluluto", "pumupunta"],
  },

  "CV~-contemp": {
    form: "CV~",
    type: "redup",
    name: "contemplated marker",
    meaning: "Reduplication signaling the action hasn't happened yet / will happen.",
    examples: ["kakain", "magluluto", "pupunta"],
  },

  // ============================================================
  // DIRECTIONAL / LOCATIONAL
  // ============================================================

  "pa-": {
    form: "pa-",
    type: "prefix",
    name: "direction / causative",
    meaning: "Toward, direction. Or: causing someone to do something.",
    examples: ["pababa", "pataas", "pabalik", "pauwi"],
  },

  "pakiki-": {
    form: "pakiki-",
    type: "prefix",
    name: "social participation",
    meaning: "Joining in, participating with others.",
    examples: ["pakikisama", "pakikipagsapalaran", "pakikipagtaguan"],
  },

  "nakikipag-": {
    form: "nakikipag-",
    type: "prefix",
    name: "social action, ongoing",
    meaning: "Engaging in mutual/social action with others, ongoing.",
    examples: ["nakikipagusap", "nakikipaglaro", "nakikipagtaguan"],
  },

  // ============================================================
  // LINKERS (not really affixes, but useful to label)
  // ============================================================

  "-ng": {
    form: "-ng",
    type: "suffix",
    name: "linker",
    meaning: "Connects modifier to noun. Used after vowels.",
    examples: ["maliit na", "malaking", "masayang"],
  },

  "na": {
    form: "na",
    type: "suffix",
    name: "linker",
    meaning: "Connects modifier to noun. Used after consonants.",
    examples: ["mabait na bata", "maliit na bahay"],
  },
};

/* Helper to get a pattern, returning undefined if not found. */
export const getPattern = (key: string): MorphPattern | undefined => MORPH_PATTERNS[key];

/* All pattern keys for iteration. */
export const PATTERN_KEYS = Object.keys(MORPH_PATTERNS);
