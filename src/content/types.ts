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

export interface Token {
  t: string; // surface text as spoken
  role: Role;
  m: string; // meaning in this sentence
  root?: string; // dictionary root if inflected (kumain -> kain)
  note?: string; // mechanism note shown on tap
  anchor?: Anchor;
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
