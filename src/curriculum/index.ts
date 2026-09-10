// Curriculum: the shared progression system
// Philosophy: BUILD THE LANGUAGE ONE PRIMITIVE AT A TIME
// Every new concept combines with concepts already known

import type { Concept } from "./types";

/**
 * The curriculum DAG: 10 concepts that compound
 *
 * actor → aspect → object → time → focus → negation → yes-no → wh-questions → combination → connectors
 *
 * Each concept unlocks new expressive power:
 * - actor: Ako. (I.)
 * - aspect: Kumain ako. (I ate.)
 * - object: Kumain ako ng mangga. (I ate mango.)
 * - time: Kumain ako ng mangga kahapon. (I ate mango yesterday.)
 * - focus: Kinain ko ang mangga. (I ate the mango.)
 * - negation: Hindi ako kumain. (I did not eat.)
 * - yes-no: Kumain ka ba? (Did you eat?)
 * - wh-questions: Ano ang kinain mo? (What did you eat?)
 * - combination: Bakit hindi ka kumain ng mangga kahapon? (Why didn't you eat mango yesterday?)
 * - connectors: Hindi ako kumain kasi... (I didn't eat because...)
 */
export const CURRICULUM: Concept[] = [
  {
    id: "actor",
    name: "Actor Pronouns",
    description: "Who does the action",
    prerequisites: [],
    vocabulary: {
      pronouns: ["ako", "ikaw", "siya", "kami", "tayo", "kayo", "sila"],
    },
    masteryThreshold: 0.8,
  },
  {
    id: "aspect",
    name: "Verb Aspects",
    description: "Completed, ongoing, or contemplated action",
    prerequisites: ["actor"],
    vocabulary: {
      verbs: ["kain"],
    },
    masteryThreshold: 0.8,
  },
  {
    id: "object",
    name: "Objects (ng)",
    description: "What the action affects",
    prerequisites: ["aspect"],
    vocabulary: {
      nouns: ["mangga", "kanin", "isda", "manok", "tinapay", "mansanas"],
    },
    masteryThreshold: 0.8,
  },
  {
    id: "time",
    name: "Time Expressions",
    description: "When the action happens",
    prerequisites: ["object"],
    vocabulary: {
      times: ["kahapon", "ngayon", "mamaya", "bukas"],
    },
    masteryThreshold: 0.8,
  },
  {
    id: "focus",
    name: "Actor/Object Focus",
    description: "Same event, different perspective",
    prerequisites: ["time"],
    vocabulary: {},
    masteryThreshold: 0.8,
  },
  {
    id: "negation",
    name: "Negation (hindi)",
    description: "Making sentences negative",
    prerequisites: ["focus"],
    vocabulary: {
      particles: ["hindi"],
    },
    masteryThreshold: 0.8,
  },
  {
    id: "yes-no",
    name: "Yes/No Questions (ba)",
    description: "Asking yes/no questions",
    prerequisites: ["negation"],
    vocabulary: {
      particles: ["ba"],
    },
    masteryThreshold: 0.8,
  },
  {
    id: "wh-questions",
    name: "Question Words",
    description: "Asking who, what, where, when, why, how",
    prerequisites: ["yes-no"],
    vocabulary: {
      particles: ["ano", "sino", "saan", "kailan", "bakit", "paano"],
    },
    masteryThreshold: 0.8,
  },
  {
    id: "combination",
    name: "Combined Patterns",
    description: "Mixing negation, questions, and full sentences",
    prerequisites: ["wh-questions"],
    vocabulary: {},
    masteryThreshold: 0.8,
  },
  {
    id: "connectors",
    name: "Connectors",
    description: "Joining clauses with and, but, because",
    prerequisites: ["combination"],
    vocabulary: {
      connectors: ["at", "pero", "kasi", "kaya"],
    },
    masteryThreshold: 0.8,
  },
];

export function getConcept(id: string): Concept | undefined {
  return CURRICULUM.find(c => c.id === id);
}

export function getConceptIndex(id: string): number {
  return CURRICULUM.findIndex(c => c.id === id);
}

// Get all concepts up to and including the given concept
export function getConceptsUpTo(id: string): Concept[] {
  const idx = getConceptIndex(id);
  if (idx === -1) return [];
  return CURRICULUM.slice(0, idx + 1);
}

// Get vocabulary available at a given concept level
export function getVocabularyUpTo(conceptId: string): {
  pronouns: string[];
  verbs: string[];
  nouns: string[];
  times: string[];
  particles: string[];
  connectors: string[];
} {
  const concepts = getConceptsUpTo(conceptId);
  const result = {
    pronouns: [] as string[],
    verbs: [] as string[],
    nouns: [] as string[],
    times: [] as string[],
    particles: [] as string[],
    connectors: [] as string[],
  };

  for (const c of concepts) {
    if (c.vocabulary.pronouns) result.pronouns.push(...c.vocabulary.pronouns);
    if (c.vocabulary.verbs) result.verbs.push(...c.vocabulary.verbs);
    if (c.vocabulary.nouns) result.nouns.push(...c.vocabulary.nouns);
    if (c.vocabulary.times) result.times.push(...c.vocabulary.times);
    if (c.vocabulary.particles) result.particles.push(...c.vocabulary.particles);
    if (c.vocabulary.connectors) result.connectors.push(...c.vocabulary.connectors);
  }

  return result;
}
