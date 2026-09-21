// Tagalog verb data: roots and their aspect forms
// Architecture supports multiple verbs with different morphology patterns.
//
// MORPHOLOGY NOTES:
// This app focuses on -um- (actor-focus) and -in- (object-focus) verbs.
// These are transitive verbs where:
//   Actor-focus: The DOER is the topic (ang), object marked with ng
//   Object-focus: The OBJECT is the topic (ang), doer marked with ng
//
// Pattern for -um- verbs (C = first consonant, V = following vowel):
//   Completed:    C-um-ROOT         (kumain)
//   Ongoing:      C-um-V-ROOT       (kumakain) - CV reduplication
//   Contemplated: CV-ROOT           (kakain)   - CV reduplication only
//
// Pattern for -in- verbs:
//   Completed:    C-in-ROOT         (kinain)
//   Ongoing:      C-in-V-ROOT       (kinakain)
//   Contemplated: CV-ROOT-in        (kakainin)

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
  meaningPast: string;         // "ate", "drank", etc.
  meaningOngoing: string;      // "eating", "drinking", etc.
  actorFocus: VerbForms;       // Actor is the topic (ang)
  objectFocus?: VerbForms;     // Object/patient is the topic (ang)
  // Semantic category for noun compatibility
  category: "consume" | "acquire" | "create" | "movement" | "perception";
  // Whether this verb is transitive (takes an object)
  transitive: boolean;
}

export const VERBS: Record<string, VerbEntry> = {
  // CONSUMPTION VERBS
  kain: {
    root: "kain",
    meaning: "eat",
    meaningPast: "ate",
    meaningOngoing: "eating",
    actorFocus: {
      completed: "kumain",      // k-um-ain
      ongoing: "kumakain",      // k-um-a-kain
      contemplated: "kakain",   // ka-kain
    },
    objectFocus: {
      completed: "kinain",      // k-in-ain
      ongoing: "kinakain",      // k-in-a-kain
      contemplated: "kakainin", // ka-kain-in
    },
    category: "consume",
    transitive: true,
  },
  inom: {
    root: "inom",
    meaning: "drink",
    meaningPast: "drank",
    meaningOngoing: "drinking",
    actorFocus: {
      completed: "uminom",      // um-inom (vowel-initial)
      ongoing: "umiinom",       // um-i-inom
      contemplated: "iinom",    // i-inom
    },
    objectFocus: {
      completed: "ininom",      // in-inom
      ongoing: "iniinom",       // in-i-inom
      contemplated: "iinumin",  // i-inom-in
    },
    category: "consume",
    transitive: true,
  },

  // ACQUISITION VERBS
  kuha: {
    root: "kuha",
    meaning: "get",
    meaningPast: "got",
    meaningOngoing: "getting",
    actorFocus: {
      completed: "kumuha",      // k-um-uha
      ongoing: "kumukuha",      // k-um-u-kuha
      contemplated: "kukuha",   // ku-kuha
    },
    objectFocus: {
      completed: "kinuha",      // k-in-uha
      ongoing: "kinukuha",      // k-in-u-kuha
      contemplated: "kukuhanin",// ku-kuha-nin (irregular but common)
    },
    category: "acquire",
    transitive: true,
  },
  bili: {
    root: "bili",
    meaning: "buy",
    meaningPast: "bought",
    meaningOngoing: "buying",
    actorFocus: {
      completed: "bumili",      // b-um-ili
      ongoing: "bumibili",      // b-um-i-bili
      contemplated: "bibili",   // bi-bili
    },
    objectFocus: {
      completed: "binili",      // b-in-ili
      ongoing: "binibili",      // b-in-i-bili
      contemplated: "bibilhin", // bi-bili-hin
    },
    category: "acquire",
    transitive: true,
  },

  // CREATION/ACTION VERBS
  gawa: {
    root: "gawa",
    meaning: "make",
    meaningPast: "made",
    meaningOngoing: "making",
    actorFocus: {
      completed: "gumawa",      // g-um-awa
      ongoing: "gumagawa",      // g-um-a-gawa
      contemplated: "gagawa",   // ga-gawa
    },
    objectFocus: {
      completed: "ginawa",      // g-in-awa
      ongoing: "ginagawa",      // g-in-a-gawa
      contemplated: "gagawin",  // ga-gawa-in
    },
    category: "create",
    transitive: true,
  },
  sulat: {
    root: "sulat",
    meaning: "write",
    meaningPast: "wrote",
    meaningOngoing: "writing",
    actorFocus: {
      completed: "sumulat",     // s-um-ulat
      ongoing: "sumusulat",     // s-um-u-sulat
      contemplated: "susulat",  // su-sulat
    },
    objectFocus: {
      completed: "sinulat",     // s-in-ulat
      ongoing: "sinusulat",     // s-in-u-sulat
      contemplated: "susulatin",// su-sulat-in
    },
    category: "create",
    transitive: true,
  },

  // PERCEPTION VERBS
  basa: {
    root: "basa",
    meaning: "read",
    meaningPast: "read",
    meaningOngoing: "reading",
    actorFocus: {
      completed: "bumasa",      // b-um-asa
      ongoing: "bumabasa",      // b-um-a-basa
      contemplated: "babasa",   // ba-basa
    },
    objectFocus: {
      completed: "binasa",      // b-in-asa
      ongoing: "binabasa",      // b-in-a-basa
      contemplated: "babasahin",// ba-basa-hin
    },
    category: "perception",
    transitive: true,
  },

  // MOVEMENT VERBS (intransitive - no object focus)
  punta: {
    root: "punta",
    meaning: "go",
    meaningPast: "went",
    meaningOngoing: "going",
    actorFocus: {
      completed: "pumunta",     // p-um-unta
      ongoing: "pumupunta",     // p-um-u-punta
      contemplated: "pupunta",  // pu-punta
    },
    // No object focus - intransitive verb
    category: "movement",
    transitive: false,
  },
};

// Legacy - kept for compatibility but verb-specific meanings are preferred
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

export function getVerbEntry(root: string): VerbEntry | undefined {
  return VERBS[root];
}

export function isTransitive(root: string): boolean {
  return VERBS[root]?.transitive ?? false;
}

export function getVerbCategory(root: string): VerbEntry["category"] | undefined {
  return VERBS[root]?.category;
}

export const VERB_ROOTS = Object.keys(VERBS);

// Get only transitive verbs (for exercises that need objects)
export const TRANSITIVE_VERB_ROOTS = Object.keys(VERBS).filter(k => VERBS[k].transitive);

// Get only intransitive verbs (for exercises without objects)
export const INTRANSITIVE_VERB_ROOTS = Object.keys(VERBS).filter(k => !VERBS[k].transitive);
