// Tagalog nouns (objects for V1 KAIN exercises)
// All are food items that naturally go with "kain"

export interface NounEntry {
  tagalog: string;
  english: string;
  englishArticle: "a" | "an" | "some" | ""; // for natural English
  symbol: string;
}

export const NOUNS: Record<string, NounEntry> = {
  mangga: {
    tagalog: "mangga",
    english: "mango",
    englishArticle: "a",
    symbol: "🥭",
  },
  kanin: {
    tagalog: "kanin",
    english: "rice",
    englishArticle: "", // uncountable
    symbol: "🍚",
  },
  isda: {
    tagalog: "isda",
    english: "fish",
    englishArticle: "", // can be countable but often generic
    symbol: "🐟",
  },
  manok: {
    tagalog: "manok",
    english: "chicken",
    englishArticle: "", // as food, uncountable
    symbol: "🍗",
  },
  tinapay: {
    tagalog: "tinapay",
    english: "bread",
    englishArticle: "", // uncountable
    symbol: "🍞",
  },
  mansanas: {
    tagalog: "mansanas",
    english: "apple",
    englishArticle: "an",
    symbol: "🍎",
  },
};

export function getNounTagalog(key: string): string {
  return NOUNS[key]?.tagalog ?? key;
}

export function getNounEnglish(key: string): string {
  const noun = NOUNS[key];
  if (!noun) return key;
  if (noun.englishArticle) {
    return `${noun.englishArticle} ${noun.english}`;
  }
  return noun.english;
}

export const NOUN_KEYS = Object.keys(NOUNS);
