// Single source of truth for all symbolic representations
// Used in both review cards and drill reference strips

import { VERBS, type VerbEntry } from "./verbs";
import { NOUNS } from "./nouns";

export const PRONOUN_DATA = [
  [{ form: "ako", symbol: "I" }],
  [{ form: "ka", symbol: "U" }, { form: "kayo", symbol: "U++" }],
  [{ form: "kami", symbol: "I++" }, { form: "tayo", symbol: "IU++" }],
  [{ form: "siya", symbol: "◇" }, { form: "sila", symbol: "◇++" }],
] as const;

// Flat list for drill strip
export const PRONOUN_LIST = [
  { form: "ako", symbol: "I" },
  { form: "ka", symbol: "U" },
  { form: "kayo", symbol: "U++" },
  { form: "kami", symbol: "I++" },
  { form: "tayo", symbol: "IU++" },
  { form: "siya", symbol: "◇" },
  { form: "sila", symbol: "◇++" },
] as const;

// Map for prompt lookups (ikaw is the full form of ka)
export const PRONOUN_SYMBOLS: Record<string, string> = {
  ako: "I",
  ka: "U",
  ikaw: "U",
  kayo: "U++",
  kami: "I++",
  tayo: "IU++",
  siya: "◇",
  sila: "◇++",
};

// Legacy VERB_DATA for kain (backward compatibility with existing drill UI)
export const VERB_DATA = [
  { form: "kumain", symbol: "×", label: "completed" },
  { form: "kumakain", symbol: "○", label: "ongoing" },
  { form: "kakain", symbol: "?", label: "future" },
] as const;

// Generate verb data dynamically for any verb root
export function getVerbDataForRoot(root: string): { form: string; symbol: string; label: string }[] {
  const verb = VERBS[root];
  if (!verb) return [];

  return [
    { form: verb.actorFocus.completed, symbol: "×", label: "completed" },
    { form: verb.actorFocus.ongoing, symbol: "○", label: "ongoing" },
    { form: verb.actorFocus.contemplated, symbol: "?", label: "future" },
  ];
}

// Generate object-focus verb data for any verb root
export function getObjectFocusVerbDataForRoot(root: string): { form: string; symbol: string; label: string }[] {
  const verb = VERBS[root];
  if (!verb || !verb.objectFocus) return [];

  return [
    { form: verb.objectFocus.completed, symbol: "×", label: "completed" },
    { form: verb.objectFocus.ongoing, symbol: "○", label: "ongoing" },
    { form: verb.objectFocus.contemplated, symbol: "?", label: "future" },
  ];
}

// Legacy NOUN_DATA for display (food only, backward compatibility)
export const NOUN_DATA = [
  { tagalog: "mangga", english: "mango", symbol: "🥭" },
  { tagalog: "kanin", english: "rice", symbol: "🍚" },
  { tagalog: "isda", english: "fish", symbol: "🐟" },
  { tagalog: "manok", english: "chicken", symbol: "🍗" },
  { tagalog: "tinapay", english: "bread", symbol: "🍞" },
  { tagalog: "mansanas", english: "apple", symbol: "🍎" },
] as const;

// Generate noun data for a specific category or verb
export function getNounDataForCategory(category: "food" | "drink" | "item" | "document" | "place"): { tagalog: string; english: string; symbol: string }[] {
  return Object.entries(NOUNS)
    .filter(([_, noun]) => noun.category === category)
    .map(([_, noun]) => ({
      tagalog: noun.tagalog,
      english: noun.english,
      symbol: noun.symbol,
    }));
}

// Map for prompt lookups - dynamically generated from NOUNS
export const NOUN_SYMBOLS: Record<string, string> = Object.fromEntries(
  Object.entries(NOUNS).map(([key, noun]) => [key, noun.symbol])
);

export const TIME_DATA = [
  [{ tagalog: "kahapon", english: "yesterday", symbol: "<" }, { tagalog: "ngayon", english: "now", symbol: "●" }],
  [{ tagalog: "mamaya", english: "later", symbol: ">" }, { tagalog: "bukas", english: "tomorrow", symbol: ">1" }],
] as const;

// Flat list for drill strip
export const TIME_LIST = [
  { tagalog: "kahapon", english: "yesterday", symbol: "<" },
  { tagalog: "ngayon", english: "now", symbol: "●" },
  { tagalog: "mamaya", english: "later", symbol: ">" },
  { tagalog: "bukas", english: "tomorrow", symbol: ">1" },
] as const;

// Map for prompt lookups
export const TIME_SYMBOLS: Record<string, string> = {
  kahapon: "<",
  ngayon: "●",
  mamaya: ">",
  bukas: ">1",
};

export const ASPECT_SYMBOLS: Record<string, string> = {
  completed: "×",
  ongoing: "○",
  contemplated: "?",
};

// Marker symbol
export const NG_SYMBOL = "→";

// Verb roots with their display labels
export const VERB_ROOT_DATA = Object.entries(VERBS).map(([root, verb]) => ({
  root,
  meaning: verb.meaning,
  transitive: verb.transitive,
  category: verb.category,
}));
