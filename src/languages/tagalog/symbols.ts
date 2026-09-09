// Single source of truth for all symbolic representations
// Used in both review cards and drill reference strips

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

export const VERB_DATA = [
  { form: "kumain", symbol: "×", label: "completed" },
  { form: "kumakain", symbol: "○", label: "ongoing" },
  { form: "kakain", symbol: "?", label: "future" },
] as const;

export const NOUN_DATA = [
  { tagalog: "mangga", english: "mango", symbol: "🥭" },
  { tagalog: "kanin", english: "rice", symbol: "🍚" },
  { tagalog: "isda", english: "fish", symbol: "🐟" },
  { tagalog: "manok", english: "chicken", symbol: "🍗" },
  { tagalog: "tinapay", english: "bread", symbol: "🍞" },
  { tagalog: "mansanas", english: "apple", symbol: "🍎" },
] as const;

// Map for prompt lookups
export const NOUN_SYMBOLS: Record<string, string> = {
  mangga: "🥭",
  kanin: "🍚",
  isda: "🐟",
  manok: "🍗",
  tinapay: "🍞",
  mansanas: "🍎",
};

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
