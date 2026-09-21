// Tagalog nouns organized by semantic category
// Categories control which verbs can naturally combine with which nouns

export type NounCategory =
  | "food"      // kain
  | "drink"     // inom
  | "item"      // kuha, bili, gawa
  | "document"  // basa, sulat
  | "place";    // punta (sa + place)

export interface NounEntry {
  tagalog: string;
  english: string;
  englishArticle: "a" | "an" | "some" | "the" | ""; // for natural English
  symbol: string;
  category: NounCategory;
}

export const NOUNS: Record<string, NounEntry> = {
  // FOOD - compatible with kain
  mangga: {
    tagalog: "mangga",
    english: "mango",
    englishArticle: "a",
    symbol: "🥭",
    category: "food",
  },
  kanin: {
    tagalog: "kanin",
    english: "rice",
    englishArticle: "",
    symbol: "🍚",
    category: "food",
  },
  isda: {
    tagalog: "isda",
    english: "fish",
    englishArticle: "",
    symbol: "🐟",
    category: "food",
  },
  manok: {
    tagalog: "manok",
    english: "chicken",
    englishArticle: "",
    symbol: "🍗",
    category: "food",
  },
  tinapay: {
    tagalog: "tinapay",
    english: "bread",
    englishArticle: "",
    symbol: "🍞",
    category: "food",
  },
  mansanas: {
    tagalog: "mansanas",
    english: "apple",
    englishArticle: "an",
    symbol: "🍎",
    category: "food",
  },
  pagkain: {
    tagalog: "pagkain",
    english: "food",
    englishArticle: "",
    symbol: "🍽️",
    category: "food",
  },
  ulam: {
    tagalog: "ulam",
    english: "viand",
    englishArticle: "the",
    symbol: "🥘",
    category: "food",
  },
  adobo: {
    tagalog: "adobo",
    english: "adobo",
    englishArticle: "",
    symbol: "🍲",
    category: "food",
  },
  sinigang: {
    tagalog: "sinigang",
    english: "sinigang",
    englishArticle: "",
    symbol: "🥣",
    category: "food",
  },

  // DRINKS - compatible with inom
  tubig: {
    tagalog: "tubig",
    english: "water",
    englishArticle: "",
    symbol: "💧",
    category: "drink",
  },
  kape: {
    tagalog: "kape",
    english: "coffee",
    englishArticle: "",
    symbol: "☕",
    category: "drink",
  },
  tsaa: {
    tagalog: "tsaa",
    english: "tea",
    englishArticle: "",
    symbol: "🍵",
    category: "drink",
  },
  juice: {
    tagalog: "juice",
    english: "juice",
    englishArticle: "",
    symbol: "🧃",
    category: "drink",
  },
  beer: {
    tagalog: "beer",
    english: "beer",
    englishArticle: "",
    symbol: "🍺",
    category: "drink",
  },
  softdrinks: {
    tagalog: "softdrinks",
    english: "soda",
    englishArticle: "",
    symbol: "🥤",
    category: "drink",
  },

  // ITEMS - compatible with kuha, bili
  bag: {
    tagalog: "bag",
    english: "bag",
    englishArticle: "the",
    symbol: "👜",
    category: "item",
  },
  phone: {
    tagalog: "phone",
    english: "phone",
    englishArticle: "the",
    symbol: "📱",
    category: "item",
  },
  pera: {
    tagalog: "pera",
    english: "money",
    englishArticle: "",
    symbol: "💵",
    category: "item",
  },
  ticket: {
    tagalog: "ticket",
    english: "ticket",
    englishArticle: "a",
    symbol: "🎫",
    category: "item",
  },
  card: {
    tagalog: "card",
    english: "card",
    englishArticle: "the",
    symbol: "💳",
    category: "item",
  },
  gamot: {
    tagalog: "gamot",
    english: "medicine",
    englishArticle: "",
    symbol: "💊",
    category: "item",
  },
  regalo: {
    tagalog: "regalo",
    english: "gift",
    englishArticle: "a",
    symbol: "🎁",
    category: "item",
  },
  damit: {
    tagalog: "damit",
    english: "clothes",
    englishArticle: "",
    symbol: "👕",
    category: "item",
  },
  sapatos: {
    tagalog: "sapatos",
    english: "shoes",
    englishArticle: "",
    symbol: "👟",
    category: "item",
  },

  // DOCUMENTS - compatible with basa, sulat
  libro: {
    tagalog: "libro",
    english: "book",
    englishArticle: "a",
    symbol: "📖",
    category: "document",
  },
  menu: {
    tagalog: "menu",
    english: "menu",
    englishArticle: "the",
    symbol: "📋",
    category: "document",
  },
  mensahe: {
    tagalog: "mensahe",
    english: "message",
    englishArticle: "a",
    symbol: "💬",
    category: "document",
  },
  pangalan: {
    tagalog: "pangalan",
    english: "name",
    englishArticle: "the",
    symbol: "✍️",
    category: "document",
  },
  email: {
    tagalog: "email",
    english: "email",
    englishArticle: "an",
    symbol: "📧",
    category: "document",
  },

  // PLACES - used with punta (sa + place) - not ng
  bahay: {
    tagalog: "bahay",
    english: "house",
    englishArticle: "the",
    symbol: "🏠",
    category: "place",
  },
  hotel: {
    tagalog: "hotel",
    english: "hotel",
    englishArticle: "the",
    symbol: "🏨",
    category: "place",
  },
  airport: {
    tagalog: "airport",
    english: "airport",
    englishArticle: "the",
    symbol: "✈️",
    category: "place",
  },
  restaurant: {
    tagalog: "restaurant",
    english: "restaurant",
    englishArticle: "the",
    symbol: "🍴",
    category: "place",
  },
  tindahan: {
    tagalog: "tindahan",
    english: "store",
    englishArticle: "the",
    symbol: "🏪",
    category: "place",
  },
  banyo: {
    tagalog: "banyo",
    english: "bathroom",
    englishArticle: "the",
    symbol: "🚻",
    category: "place",
  },
  palengke: {
    tagalog: "palengke",
    english: "market",
    englishArticle: "the",
    symbol: "🛒",
    category: "place",
  },
  mall: {
    tagalog: "mall",
    english: "mall",
    englishArticle: "the",
    symbol: "🏬",
    category: "place",
  },
  terminal: {
    tagalog: "terminal",
    english: "terminal",
    englishArticle: "the",
    symbol: "🚏",
    category: "place",
  },
  ospital: {
    tagalog: "ospital",
    english: "hospital",
    englishArticle: "the",
    symbol: "🏥",
    category: "place",
  },
};

// Verb category -> compatible noun categories
export const VERB_NOUN_COMPATIBILITY: Record<string, NounCategory[]> = {
  consume: ["food", "drink"],  // kain = food only, inom = drink only (handled specially)
  acquire: ["item", "food", "drink", "document"],  // kuha, bili
  create: ["item", "document", "food"],  // gawa, sulat
  perception: ["document", "item"],  // basa
  movement: ["place"],  // punta - uses sa not ng
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

export function getNounCategory(key: string): NounCategory | undefined {
  return NOUNS[key]?.category;
}

// Get nouns compatible with a specific verb
export function getNounsForVerb(verbRoot: string): string[] {
  // Special cases for specific verbs
  if (verbRoot === "kain") {
    return Object.keys(NOUNS).filter(k => NOUNS[k].category === "food");
  }
  if (verbRoot === "inom") {
    return Object.keys(NOUNS).filter(k => NOUNS[k].category === "drink");
  }
  if (verbRoot === "basa") {
    return Object.keys(NOUNS).filter(k => NOUNS[k].category === "document");
  }
  if (verbRoot === "sulat") {
    return Object.keys(NOUNS).filter(k =>
      NOUNS[k].category === "document" && k !== "libro" // you don't "write a book" in this context
    );
  }
  if (verbRoot === "punta") {
    return Object.keys(NOUNS).filter(k => NOUNS[k].category === "place");
  }
  // General acquire verbs (kuha, bili)
  if (verbRoot === "kuha" || verbRoot === "bili") {
    return Object.keys(NOUNS).filter(k =>
      ["item", "food", "drink", "document"].includes(NOUNS[k].category)
    );
  }
  // gawa - make things
  if (verbRoot === "gawa") {
    return Object.keys(NOUNS).filter(k =>
      ["item", "food", "document"].includes(NOUNS[k].category)
    );
  }

  // Fallback: all non-place nouns
  return Object.keys(NOUNS).filter(k => NOUNS[k].category !== "place");
}

// All noun keys
export const NOUN_KEYS = Object.keys(NOUNS);

// Filtered noun lists by category
export const FOOD_NOUNS = Object.keys(NOUNS).filter(k => NOUNS[k].category === "food");
export const DRINK_NOUNS = Object.keys(NOUNS).filter(k => NOUNS[k].category === "drink");
export const ITEM_NOUNS = Object.keys(NOUNS).filter(k => NOUNS[k].category === "item");
export const DOCUMENT_NOUNS = Object.keys(NOUNS).filter(k => NOUNS[k].category === "document");
export const PLACE_NOUNS = Object.keys(NOUNS).filter(k => NOUNS[k].category === "place");
