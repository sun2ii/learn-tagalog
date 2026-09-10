// Tagalog particles: question markers, negation, question words

export interface Particle {
  tagalog: string;
  english: string;
  type: "negation" | "question_marker" | "question_word";
}

export const PARTICLES: Record<string, Particle> = {
  // Negation
  hindi: { tagalog: "hindi", english: "not", type: "negation" },

  // Question marker
  ba: { tagalog: "ba", english: "(question)", type: "question_marker" },

  // Question words
  ano: { tagalog: "ano", english: "what", type: "question_word" },
  sino: { tagalog: "sino", english: "who", type: "question_word" },
  saan: { tagalog: "saan", english: "where", type: "question_word" },
  kailan: { tagalog: "kailan", english: "when", type: "question_word" },
  bakit: { tagalog: "bakit", english: "why", type: "question_word" },
  paano: { tagalog: "paano", english: "how", type: "question_word" },
};

export const QUESTION_WORDS = ["ano", "sino", "saan", "kailan", "bakit", "paano"] as const;
export type QuestionWord = typeof QUESTION_WORDS[number];

export function getParticle(key: string): Particle | undefined {
  return PARTICLES[key];
}

export function isQuestionWord(key: string): key is QuestionWord {
  return QUESTION_WORDS.includes(key as QuestionWord);
}
