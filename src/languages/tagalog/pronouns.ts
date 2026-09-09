// Tagalog pronouns
// ANG-form (topic), NG-form (non-topic), SA-form (oblique)
// For V1 actor-focus verbs, we use ANG-form pronouns after the verb.

export interface PronounEntry {
  ang: string;      // topic form (used as actor in actor-focus)
  ng: string;       // non-topic form
  sa: string;       // oblique form
  english: string;
  englishSubject: string;  // "I", "you", "he/she", etc.
  plural: boolean;
  inclusive?: boolean; // for "we" distinction
}

export const PRONOUNS: Record<string, PronounEntry> = {
  ako: {
    ang: "ako",
    ng: "ko",
    sa: "akin",
    english: "me",
    englishSubject: "I",
    plural: false,
  },
  ikaw: {
    ang: "ka",       // short form after verb; "ikaw" at start of sentence
    ng: "mo",
    sa: "iyo",
    english: "you (singular)",
    englishSubject: "you",
    plural: false,
  },
  siya: {
    ang: "siya",
    ng: "niya",
    sa: "kanya",
    english: "him/her",
    englishSubject: "he/she",
    plural: false,
  },
  kami: {
    ang: "kami",
    ng: "namin",
    sa: "amin",
    english: "us (exclusive)",
    englishSubject: "we",
    plural: true,
    inclusive: false,
  },
  tayo: {
    ang: "tayo",
    ng: "natin",
    sa: "atin",
    english: "us (inclusive)",
    englishSubject: "we",
    plural: true,
    inclusive: true,
  },
  kayo: {
    ang: "kayo",
    ng: "ninyo",
    sa: "inyo",
    english: "you (plural)",
    englishSubject: "you all",
    plural: false, // grammatically can be singular formal too
  },
  sila: {
    ang: "sila",
    ng: "nila",
    sa: "kanila",
    english: "them",
    englishSubject: "they",
    plural: true,
  },
};

// For actor-focus verbs, the actor follows the verb in ang-form
// But "ikaw" becomes "ka" after the verb
export function getActorForm(pronounKey: string): string {
  if (pronounKey === "ikaw") return "ka";
  return PRONOUNS[pronounKey]?.ang ?? pronounKey;
}

// For object-focus verbs, the actor becomes the agent (ng-form)
// "ikaw" becomes "mo", "ako" becomes "ko", etc.
export function getAgentForm(pronounKey: string): string {
  return PRONOUNS[pronounKey]?.ng ?? pronounKey;
}

export function getEnglishSubject(pronounKey: string): string {
  return PRONOUNS[pronounKey]?.englishSubject ?? pronounKey;
}

export const PRONOUN_KEYS = Object.keys(PRONOUNS);
