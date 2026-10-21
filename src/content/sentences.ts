// Sentences: four journeys. Each one builds ONE sentence, clause by clause.
//   START SMALL → ADD A THOUGHT → CONNECT IDEAS → BUILD A COMPLETE SENTENCE
// Every step adds one grammatical relation to the same sentence, with as few new words
// as possible, so the learner's attention stays on how the connector joins the ideas.
// At the end: the whole sentence, the connectors it used, and one final challenge:
// the whole sentence from Indonesian.
//
// Connectors live in one dictionary so an explanation is written once and reused.
//
// To add a journey: append to JOURNEYS. Each step's `join` says how its clause attaches:
// "comma" continues after a comma, "space" continues with no comma, "new" starts a
// fresh sentence (avoid it: the point is one sentence). The sentence is composed from
// the steps, so it is never written twice. Joined clauses are lowercased, so do not
// start them with a name. Write clauses without trailing punctuation.

import { PRACTICE } from "./practice";

export interface Connector {
  word: string;               // surface form as it appears in sentences: "kaya", "galing sa", "na lang"
  meaning: string;            // Indonesian equivalent
  function: string;           // what it does between ideas
  pattern: string;            // slot pattern in caps
  example: string;            // one short Tagalog example
  exampleTranslation: string; // its Indonesian
}

export interface Vocab {
  tagalog: string;
  indonesian: string;
  build?: string;  // how the form is assembled: "ma + tu~ + tulog". ~ marks the doubled syllable
  root?: string;   // "tulog = tidur"
}

/* Shown under the word list whenever a build is present. */
export const BUILD_LEGEND = "~ doubled syllable carries akan (belum terjadi) · um, nag, na = sudah · doubled + um / nag / na = sedang · bare mag, ma, um = bentuk dasar, used after bago, para, habang";

export type Join = "new" | "comma" | "space";

export interface Step {
  indonesian: string;         // the clause to translate
  tagalog: string;            // the expected clause, as it would stand alone (capitalised, with its full stop)
  acceptedAnswers?: string[]; // alternates besides `tagalog`; compared after normalization
  join: Join;                 // how this clause attaches to the passage so far
  connectors: string[];       // keys into CONNECTORS this clause uses
  vocabulary: Vocab[];        // words a learner needs beyond the connectors
  hint?: string;              // one structural hint
}

/* ---- Practice deeper: BUILD (steps) → SUBSTITUTE → RECOMBINE → CREATE ---- */

/** Same grammar as a clause of the journey, new words. */
export interface SubstituteEx {
  original: { tagalog: string; indonesian: string }; // the journey clause this mirrors
  indonesian: string;
  tagalog: string;
  acceptedAnswers?: string[];
  grammarFocus: string;       // the frame that stays fixed: "ACTION + DAHIL + REASON"
  explanation: string;        // what changed and what did not
  connectors: string[];
  vocabulary: Vocab[];
}

/** A new situation that needs 2 to 4 of the journey's connectors; the learner picks them. */
export interface RecombineEx {
  indonesian: string;
  tagalog: string;
  acceptedAnswers?: string[];
  connectors: string[];       // not shown before the answer
  explanation: { connector: string; note: string }[]; // per connector, shown after
  vocabulary: Vocab[];
}

/** A situation to describe freely. Not judged; one natural example is shown for comparison. */
export interface CreateEx {
  situation: string[];        // two or three short lines
  task: string;               // what to say
  exampleAnswer: string;
  exampleIndonesian: string;
  connectors: string[];       // highlighted in the example
  explanation: string;
}

export interface JourneyPractice {
  substitute: SubstituteEx[];
  recombine: RecombineEx[];
  create: CreateEx[];
}

export type PracticeMode = keyof JourneyPractice;

export interface Journey extends JourneyPractice {
  id: string;
  title: string;
  blurb: string;              // one line: what the sentence is about
  grammar: string[];          // connector keys learned, shown at the end in this order
  steps: Step[];              // BUILD
}

/* Something every step can be checked against: the clause and what it is made of. */
export interface Target { tagalog: string; acceptedAnswers?: string[] }
export interface Context { connectors: string[]; vocabulary: Vocab[] }

export const CONNECTORS: Record<string, Connector> = {
  "galing-sa": { word: "galing sa", meaning: "Dari / datang dari", function: "Origin: coming from a place", pattern: "GALING + ACTOR + SA + PLACE", example: "Galing ako sa Maynila.", exampleTranslation: "Aku dari Manila." },
  "papunta-sa": { word: "papunta sa", meaning: "Menuju / ke", function: "Destination: heading to a place", pattern: "PAPUNTA + ACTOR + SA + PLACE", example: "Papunta ako sa paaralan.", exampleTranslation: "Aku menuju sekolah." },
  kasama: { word: "kasama", meaning: "Bersama / sama", function: "Accompaniment: together with someone", pattern: "ACTION + KASAMA + ANG + PERSON", example: "Kumain ako kasama ang pamilya ko.", exampleTranslation: "Aku makan bersama keluargaku." },
  pero: { word: "pero", meaning: "Tapi", function: "Contrast", pattern: "A, PERO B", example: "Gusto ko, pero wala akong pera.", exampleTranslation: "Aku mau, tapi aku nggak punya uang." },
  dahil: { word: "dahil", meaning: "Karena", function: "Reason", pattern: "RESULT + DAHIL + REASON", example: "Umuwi ako dahil umuulan.", exampleTranslation: "Aku pulang karena hujan." },
  kaya: { word: "kaya", meaning: "Jadi / makanya", function: "Result / consequence", pattern: "REASON + KAYA + RESULT", example: "Gutom ako, kaya kakain ako.", exampleTranslation: "Aku lapar, jadi aku akan makan." },
  kahit: { word: "kahit", meaning: "Meskipun", function: "Concession: despite this", pattern: "KAHIT + CONDITION, + ACTION", example: "Kahit pagod, pumasok siya.", exampleTranslation: "Meskipun capek, dia masuk kerja." },
  "pa-rin": { word: "pa rin", meaning: "Tetap / masih", function: "Still, anyway. Often answers a kahit", pattern: "KAHIT + X, + ACTION + PA RIN", example: "Kahit umuulan, pumasok pa rin ako.", exampleTranslation: "Meskipun hujan, aku tetap masuk kerja." },
  habang: { word: "habang", meaning: "Sambil / sementara", function: "Two things at the same time", pattern: "ACTION 1 + HABANG + ACTION 2", example: "Nagbabasa ako habang kumakain.", exampleTranslation: "Aku membaca sambil makan." },
  nang: { word: "nang", meaning: "Dengan / ketika", function: "Links how something was done (umulan nang malakas), or when, for something already past", pattern: "ACTION + NANG + HOW · NANG + PAST EVENT, + RESULT", example: "Tumakbo siya nang mabilis.", exampleTranslation: "Dia lari dengan cepat." },
  para: { word: "para", meaning: "Untuk / supaya", function: "Purpose", pattern: "ACTION + PARA + GOAL (verb)", example: "Nag-aaral ako para pumasa.", exampleTranslation: "Aku belajar supaya lulus." },
  bago: { word: "bago", meaning: "Sebelum", function: "Sequence: this before that", pattern: "BAGO + ACTION, + ACTION", example: "Maghugas ka ng kamay bago kumain.", exampleTranslation: "Cuci tangan sebelum makan." },
  pagkatapos: { word: "pagkatapos", meaning: "Setelah", function: "Sequence: after that", pattern: "PAGKATAPOS + (NG) + EVENT, + ACTION", example: "Pagkatapos kumain, naglakad kami.", exampleTranslation: "Setelah makan, kami jalan-jalan." },
  kung: { word: "kung", meaning: "Kalau", function: "Condition: if this were so", pattern: "KUNG + CONDITION, + RESULT", example: "Kung may pera ako, bibili ako.", exampleTranslation: "Kalau aku punya uang, aku akan beli." },
  kapag: { word: "kapag", meaning: "Ketika / kalau", function: "Condition: whenever this happens", pattern: "KAPAG + EVENT, + ACTION", example: "Kapag umuulan, nagbabasa ako.", exampleTranslation: "Kalau hujan, aku membaca." },
  muna: { word: "muna", meaning: "Dulu", function: "First / for now. Sits right after the first word", pattern: "VERB + MUNA + ACTOR", example: "Uupo muna ako.", exampleTranslation: "Aku duduk dulu." },
  "na-lang": { word: "na lang", meaning: "Aja", function: "Settling for the simpler option", pattern: "OPTION + NA LANG", example: "Dito na lang tayo.", exampleTranslation: "Di sini aja kita." },
  "pa-lang": { word: "pa lang", meaning: "Baru / baru saja", function: "Only just; no further than this", pattern: "POINT IN TIME + PA LANG", example: "Alas otso pa lang.", exampleTranslation: "Baru jam delapan." },
  na: { word: "na", meaning: "Sudah", function: "Already; the state has arrived. Sits after the first word", pattern: "STATE + NA + ACTOR", example: "Pagod na ako.", exampleTranslation: "Aku sudah capek." },
};

/* BUILD only; the practice modes are merged in from ./practice.ts below. */
const BUILD: Omit<Journey, PracticeMode>[] = [
  {
    id: "going-somewhere", title: "Going somewhere",
    blurb: "Where you came from, where you are going, and the stop on the way.",
    grammar: ["galing-sa", "papunta-sa", "kasama", "pero", "muna", "para", "bago"],
    steps: [
      {
        indonesian: "Aku dari rumah", tagalog: "Galing ako sa bahay", join: "new",
        connectors: ["galing-sa"],
        vocabulary: [{ tagalog: "bahay", indonesian: "rumah" }],
        hint: "galing, then the actor, then sa + place.",
      },
      {
        indonesian: "menuju mal bersama temanku", tagalog: "papunta sa mall kasama ang kaibigan ko", join: "comma",
        acceptedAnswers: ["papunta sa mall kasama ng kaibigan ko"],
        connectors: ["papunta-sa", "kasama"],
        vocabulary: [{ tagalog: "mall", indonesian: "mal" }, { tagalog: "kaibigan", indonesian: "teman" }, { tagalog: "ko", indonesian: "-ku" }],
        hint: "The actor was said in step 1, so papunta sa mall needs no ako. kasama takes ang + the person.",
      },
      {
        indonesian: "tapi aku akan mampir dulu ke toko", tagalog: "pero dadaan muna ako sa tindahan", join: "comma",
        connectors: ["pero", "muna"],
        vocabulary: [{ tagalog: "dadaan", indonesian: "akan mampir / lewat", build: "da~ + daan", root: "daan = lewat / jalan" }, { tagalog: "tindahan", indonesian: "toko" }],
        hint: "pero opens the clause; muna slips in right after the verb, before ako.",
      },
      {
        indonesian: "untuk membeli air", tagalog: "para bumili ng tubig", join: "space",
        connectors: ["para"],
        vocabulary: [{ tagalog: "bumili", indonesian: "membeli", build: "b + um + ili", root: "bili = beli" }, { tagalog: "tubig", indonesian: "air" }],
        hint: "para + a bare verb. No actor is repeated; ng marks the thing bought.",
      },
      {
        indonesian: "sebelum kami makan", tagalog: "bago kami kumain", join: "space",
        acceptedAnswers: ["bago kumain"],
        connectors: ["bago"],
        vocabulary: [{ tagalog: "kami", indonesian: "kami" }, { tagalog: "kumain", indonesian: "makan", build: "k + um + ain", root: "kain = makan" }],
        hint: "bago + actor + bare verb. The verb after bago never carries aspect.",
      },
    ],
  },
  {
    id: "a-long-day", title: "A long day",
    blurb: "Up early for a meeting, still tired, coffee first.",
    grammar: ["dahil", "pero", "pa-rin", "kaya", "muna", "bago"],
    steps: [
      {
        indonesian: "Aku bangun pagi-pagi", tagalog: "Gumising ako nang maaga", join: "new",
        acceptedAnswers: ["Maaga akong gumising"],
        connectors: [],
        vocabulary: [{ tagalog: "gumising", indonesian: "bangun", build: "g + um + ising", root: "gising = bangun" }, { tagalog: "nang maaga", indonesian: "pagi-pagi / lebih awal" }],
        hint: "Verb, actor, then nang + how: nang maaga.",
      },
      {
        indonesian: "karena aku ada rapat", tagalog: "dahil may meeting ako", join: "space",
        acceptedAnswers: ["dahil may meeting"],
        connectors: ["dahil"],
        vocabulary: [{ tagalog: "may meeting", indonesian: "ada rapat" }],
        hint: "dahil + the reason. may + thing + ako: I have a meeting.",
      },
      {
        indonesian: "tapi aku masih capek", tagalog: "pero pagod pa rin ako", join: "comma",
        acceptedAnswers: ["pero pagod pa ako"],
        connectors: ["pero", "pa-rin"],
        vocabulary: [{ tagalog: "pagod", indonesian: "capek" }],
        hint: "pero, the state, pa rin, then ako. pa rin sits right after the first word.",
      },
      {
        indonesian: "jadi aku minum kopi dulu", tagalog: "kaya iinom muna ako ng kape", join: "comma",
        connectors: ["kaya", "muna"],
        vocabulary: [{ tagalog: "iinom", indonesian: "minum / akan minum", build: "i~ + inom", root: "inom = minum" }, { tagalog: "kape", indonesian: "kopi" }],
        hint: "kaya + the result. Future verb, muna, ako, then ng + the thing drunk.",
      },
      {
        indonesian: "sebelum pergi ke kantor", tagalog: "bago pumunta sa opisina", join: "space",
        acceptedAnswers: ["bago ako pumunta sa opisina"],
        connectors: ["bago"],
        vocabulary: [{ tagalog: "pumunta", indonesian: "pergi", build: "p + um + unta", root: "punta = pergi" }, { tagalog: "opisina", indonesian: "kantor" }],
        hint: "bago + bare verb + sa + place. The actor is already known.",
      },
    ],
  },
  {
    id: "making-plans", title: "Making plans",
    blurb: "Tomorrow, if you are free: eat out, or cook if it rains.",
    grammar: ["kung", "kapag", "pero", "na-lang", "kaya", "muna"],
    steps: [
      {
        indonesian: "Kalau kamu bebas besok", tagalog: "Kung libre ka bukas", join: "new",
        connectors: ["kung"],
        vocabulary: [{ tagalog: "libre", indonesian: "bebas / luang" }, { tagalog: "ka", indonesian: "kamu" }, { tagalog: "bukas", indonesian: "besok" }],
        hint: "kung + the condition. ka, not ikaw: it follows the describe-word.",
      },
      {
        indonesian: "ayo kita makan di luar", tagalog: "kumain tayo sa labas", join: "comma",
        acceptedAnswers: ["kakain tayo sa labas"],
        connectors: [],
        vocabulary: [{ tagalog: "kumain tayo", indonesian: "ayo kita makan" }, { tagalog: "sa labas", indonesian: "di luar" }],
        hint: "Plain verb + tayo is an invitation: let's eat.",
      },
      {
        indonesian: "tapi kalau hujan", tagalog: "pero kapag umuulan", join: "comma",
        connectors: ["pero", "kapag"],
        vocabulary: [{ tagalog: "umuulan", indonesian: "hujan (sedang)", build: "um + u~ + ulan", root: "ulan = hujan" }],
        hint: "kapag, not kung: rain is a whenever, not a hypothetical.",
      },
      {
        indonesian: "kita masak aja di rumah", tagalog: "magluto na lang tayo sa bahay", join: "comma",
        acceptedAnswers: ["magluluto na lang tayo sa bahay"],
        connectors: ["na-lang"],
        vocabulary: [{ tagalog: "magluto", indonesian: "masak", build: "mag + luto", root: "luto = masak" }, { tagalog: "bahay", indonesian: "rumah" }],
        hint: "Verb, na lang, tayo, sa + place. na lang sits right after the verb.",
      },
      {
        indonesian: "jadi aku akan telepon kamu dulu", tagalog: "kaya tatawagan muna kita", join: "comma",
        connectors: ["kaya", "muna"],
        vocabulary: [{ tagalog: "tatawagan kita", indonesian: "akan kutelepon kamu / akan telepon kamu", build: "ta~ + tawag + an", root: "tawag = telepon · kita = aku → kamu" }],
        hint: "kita here is one word for 'I, to you'. muna goes between the verb and kita.",
      },
    ],
  },
  {
    id: "telling-a-story", title: "Telling a story",
    blurb: "Waiting for a bus, the rain, and the walk home.",
    grammar: ["habang", "nang", "pero", "dahil", "kaya", "na-lang"],
    steps: [
      {
        indonesian: "Sambil aku menunggu bus", tagalog: "Habang naghihintay ako ng bus", join: "new",
        connectors: ["habang"],
        vocabulary: [{ tagalog: "naghihintay", indonesian: "menunggu", build: "nag + hi~ + hintay", root: "hintay = tunggu" }, { tagalog: "bus", indonesian: "bus" }],
        hint: "habang + ongoing verb + actor. ng marks what is being waited for.",
      },
      {
        indonesian: "hujan turun deras", tagalog: "umulan nang malakas", join: "comma",
        connectors: ["nang"],
        vocabulary: [{ tagalog: "umulan", indonesian: "hujan turun (sudah)", build: "um + ulan", root: "ulan = hujan" }, { tagalog: "malakas", indonesian: "deras / kuat" }],
        hint: "Completed verb, then nang + how. nang, not ng, links the manner.",
      },
      {
        indonesian: "tapi aku nggak pulang", tagalog: "pero hindi ako umuwi", join: "comma",
        connectors: ["pero"],
        vocabulary: [{ tagalog: "hindi", indonesian: "nggak" }, { tagalog: "umuwi", indonesian: "pulang", build: "um + uwi", root: "uwi = pulang" }],
        hint: "hindi pulls ako forward: hindi ako umuwi.",
      },
      {
        indonesian: "karena aku bawa payung", tagalog: "dahil may dala akong payong", join: "space",
        acceptedAnswers: ["dahil may payong ako"],
        connectors: ["dahil"],
        vocabulary: [{ tagalog: "may dala akong", indonesian: "aku bawa" }, { tagalog: "payong", indonesian: "payung" }],
        hint: "dahil + may dala akong + thing: I have (something) carried.",
      },
      {
        indonesian: "jadi aku jalan kaki aja", tagalog: "kaya naglakad na lang ako", join: "comma",
        connectors: ["kaya", "na-lang"],
        vocabulary: [{ tagalog: "naglakad", indonesian: "jalan kaki (sudah)", build: "nag + lakad", root: "lakad = jalan" }],
        hint: "kaya + verb + na lang + ako.",
      },
    ],
  },
];

export const JOURNEYS: Journey[] = BUILD.map((j) => ({ ...j, ...(PRACTICE[j.id] ?? { substitute: [], recombine: [], create: [] }) }));

export const journeyById = (id: string) => JOURNEYS.find((j) => j.id === id);
