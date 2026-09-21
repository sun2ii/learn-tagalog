// UI-side exercise source. Builds SentenceStates for every workout and hands
// them to the language renderer. No linguistic rules live here – only which
// combinations to ask for. The renderer decides what the Tagalog looks like.

import type { SentenceState, Focus, QuestionWord } from "@/engine/types";
import { nextVerbEx } from "./verbs";
import { render, isValidState, type RenderedSentence, type SentencePart } from "@/languages/tagalog/renderer";
import { PRONOUN_KEYS } from "@/languages/tagalog/pronouns";
import { NOUNS, getNounsForVerb } from "@/languages/tagalog/nouns";
import { VERBS } from "@/languages/tagalog/verbs";
import { englishFor } from "./english";
import { TIME_KEYS, isTimeCompatible } from "@/languages/tagalog/time";

export type ExKind = "gym" | "build" | "question";

export interface CardEx {
  kind: "card";
  card: { id: string; front: string; back: string; sub?: string; note?: string; aspect?: "contemplated" | "ongoing" | "completed" };
  concept: string;
}
import type { VerbEx } from "./verbs";
export type Ex = SentenceEx | CardEx | VerbEx;

export interface SentenceEx {
  kind: ExKind;
  state: SentenceState;          // the target sentence
  base?: SentenceState;          // for transformations: the sentence you start from
  target: RenderedSentence;
  from?: RenderedSentence;
  instruction?: string;          // "Make it a yes/no question", "Ask why"
  concept: string;               // curriculum concept this rep exercises
}

const ASPECTS = ["contemplated", "ongoing", "completed"]; // not yet → ongoing → done (0 → ½ → 1)
const ROOT = "kain";

// Objects that go with "kain". Works with both the flat and the categorised noun table.
const FOOD = Object.keys(NOUNS).filter((k) => {
  const c = (NOUNS[k] as { category?: string }).category;
  return !c || c === "food";
});

const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function shuffle<T>(arr: readonly T[]): T[] {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

/** Roots beyond kain that the renderer can build with a matching object. */
export const OTHER_ROOTS = Object.keys(VERBS).filter((r) => r !== ROOT && VERBS[r].transitive && getNounsForVerb(r).length > 0);

function statement(opts: { focus?: Focus[]; time?: boolean; object?: boolean; root?: string } = {}): SentenceState {
  const focus: Focus = pick<Focus>(opts.focus ?? ["actor"]);
  const root = opts.root ?? ROOT;
  const objects = root === ROOT ? FOOD : getNounsForVerb(root);
  for (let tries = 0; tries < 20; tries++) {
    const s: SentenceState = { root, aspect: pick(ASPECTS), actor: pick(PRONOUN_KEYS), focus };
    if (opts.object !== false && (focus === "object" || Math.random() < 0.85)) s.object = pick(objects);
    if (opts.time && Math.random() < 0.6) {
      const ok = TIME_KEYS.filter((t) => isTimeCompatible(t, s.aspect));
      if (ok.length) s.time = pick(ok);
    }
    if (isValidState(s)) return s;
  }
  return { root: ROOT, aspect: "completed", actor: "ako", focus: "actor" as Focus, object: FOOD[0] };
}

const WH: QuestionWord[] = ["ano", "sino", "saan", "kailan", "bakit", "paano"];
const WH_EN: Record<QuestionWord, string> = { ano: "what", sino: "who", saan: "where", kailan: "when", bakit: "why", paano: "how" };

/** Which curriculum concept a state mainly exercises. */
export function conceptFor(s: SentenceState): string {
  if (s.mood === "wh_question") return "wh-questions";
  if (s.mood === "yes_no") return s.polarity === "negative" ? "combination" : "yes-no";
  if (s.polarity === "negative") return "negation";
  if (s.focus === "object") return "focus";
  if (s.time) return "time";
  if (s.object) return "object";
  return "aspect";
}

function make(kind: ExKind, state: SentenceState, base?: SentenceState, instruction?: string): SentenceEx {
  const target = render(state);
  if (state.root !== ROOT) target.english = englishFor(state);
  const from = base ? render(base) : undefined;
  if (from && base && base.root !== ROOT) from.english = englishFor(base);
  return {
    kind, state, base,
    target,
    from,
    instruction,
    concept: conceptFor(state),
  };
}

/* ---------------- Workouts (Grammar Gym) ---------------- */

export interface Workout {
  id: string;
  name: string;
  tagline: string;
  example: string;
  concept: string;        // curriculum concept it advances
  next: () => SentenceEx;
}

export const WORKOUTS: Workout[] = [
  {
    id: "actor", name: "Actor focus", tagline: "Who · did what · to what · when", example: "Kumain ako ng mangga kahapon.", concept: "time",
    next: () => make("gym", statement({ time: true })),
  },
  {
    id: "focus", name: "Focus / voice", tagline: "Same event, spotlight moves", example: "Kinain ko ang mangga.", concept: "focus",
    next: () => make("gym", statement({ focus: ["actor", "object"] })),
  },
  {
    id: "negation", name: "Negation", tagline: "hindi steps in front, the actor slides forward", example: "Hindi ako kumain ng mangga.", concept: "negation",
    next: () => {
      const s = statement({ time: true });
      if (Math.random() < 0.7) s.polarity = "negative";
      return make("gym", s);
    },
  },
  {
    id: "yesno", name: "Yes / no questions", tagline: "ba lands after the first piece", example: "Kumain ka ba ng mangga?", concept: "yes-no",
    next: () => {
      const s = statement({ time: true });
      if (Math.random() < 0.75) s.mood = "yes_no";
      return make("gym", s);
    },
  },
  {
    id: "wh", name: "Question words", tagline: "bakit · kailan · saan · ano · sino", example: "Bakit ka kumain ng mangga?", concept: "wh-questions",
    next: () => {
      const s = statement({ time: true });
      s.mood = "wh_question"; s.questionWord = pick(WH);
      return make("gym", s);
    },
  },
  {
    id: "verbs", name: "Other verbs", tagline: "Same machine, different root: inom · bili · kuha · basa · sulat · gawa", example: "Bumili siya ng tinapay kahapon.", concept: "aspect",
    next: () => make("gym", statement({ time: true, root: pick(OTHER_ROOTS) })),
  },
  {
    id: "mix", name: "Everything", tagline: "Statements, negation, questions, focus, every verb – shuffled", example: "Hindi ka ba kumain kahapon?", concept: "combination",
    next: () => make("gym", anyState()),
  },
];

export function anyState(): SentenceState {
  const r = Math.random();
  if (r < 0.15) return statement({ time: true, root: pick(OTHER_ROOTS) });
  if (r < 0.3) return statement({ time: true });
  if (r < 0.45) return statement({ focus: ["object"] });
  const s = statement({ time: true });
  if (r < 0.6) { s.polarity = "negative"; return s; }
  if (r < 0.75) { s.mood = "yes_no"; if (Math.random() < 0.3) s.polarity = "negative"; return s; }
  s.mood = "wh_question"; s.questionWord = pick(WH);
  return s;
}

export function getWorkout(id: string): Workout | undefined {
  return WORKOUTS.find((w) => w.id === id);
}

/* ---------------- Builder ---------------- */

/** A target sentence plus a couple of near-miss pieces. */
export function nextBuild(level: "simple" | "full" = "full"): SentenceEx {
  const s = level === "simple" ? statement({ time: false }) : anyState();
  return make("build", s);
}

/** Distractor pieces that look plausible: other aspect of the verb, other pronoun form. */
export function distractorsFor(ex: SentenceEx, count = 2): SentencePart[] {
  const out: SentencePart[] = [];
  const s = ex.state;
  const alt = { ...s, aspect: pick(ASPECTS.filter((a) => a !== s.aspect)) };
  const altV = render(alt).parts.find((p) => p.dimension === "verb");
  if (altV) out.push({ ...altV, text: altV.text.toLowerCase() });
  const altA = { ...s, actor: pick(PRONOUN_KEYS.filter((a) => a !== s.actor)) };
  const altP = render(altA).parts.find((p) => p.dimension === "actor");
  if (altP) out.push(altP);
  if (!s.time && Math.random() < 0.5) out.push({ text: pick(TIME_KEYS), dimension: "time" });
  return shuffle(out).slice(0, count);
}

/* ---------------- Questions ---------------- */

export type QuestionDrillKind = "yesno" | "wh" | "mixed";

export function nextQuestion(kind: QuestionDrillKind = "mixed"): SentenceEx {
  const base = statement({ time: Math.random() < 0.4 });
  const wantWh = kind === "wh" || (kind === "mixed" && Math.random() < 0.6);
  if (wantWh) {
    const q = pick(WH);
    const target: SentenceState = { ...base, mood: "wh_question", questionWord: q };
    return make("question", target, base, `Ask ${WH_EN[q]}`);
  }
  const target: SentenceState = { ...base, mood: "yes_no" };
  return make("question", target, base, "Make it a yes / no question");
}

/* ---------------- Sessions ---------------- */

/** Mixed session: rotate through modes so a 10-minute block touches everything,
    and slip in whatever flashcards are due (phrases and words) every third rep. */
export function makeSession(cards: CardEx["card"][]): (i: number) => Ex {
  const queue = shuffle(cards).slice(0, 30);
  let k = 0;
  return (i: number) => {
    if (queue.length && i % 3 === 2) { const card = queue[k % queue.length]; k++; return { kind: "card", card, concept: "actor" }; }
    const slot = i % 8;
    if (slot === 0 || slot === 4) return make("gym", anyState());
    if (slot === 1 || slot === 5) return nextBuild();
    if (slot === 3 || slot === 7) return nextVerbEx("mix", "all", i);
    return nextQuestion();
  };
}

/* ---------------- Checking ---------------- */

export const normalize = (s: string) => s.toLowerCase().replace(/[.,!?]/g, "").replace(/\s+/g, " ").trim();

export function isCorrect(answer: string, ex: SentenceEx): boolean {
  return normalize(answer) === normalize(ex.target.tagalog);
}

/** Tokens of a wrong answer that aren't in the target – for the "what went wrong" reveal. */
export function wrongTokens(answer: string, ex: SentenceEx): { text: string; wrong: boolean }[] {
  const want = new Map<string, number>();
  ex.target.parts.forEach((p) => { const t = normalize(p.text); want.set(t, (want.get(t) ?? 0) + 1); });
  return normalize(answer).split(" ").filter(Boolean).map((t) => {
    const n = want.get(t) ?? 0;
    if (n > 0) { want.set(t, n - 1); return { text: t, wrong: false }; }
    return { text: t, wrong: true };
  });
}

/** The word bank shown on demand under a typed exercise. */
export function wordBank(state: SentenceState): { label: string; role: SentencePart["dimension"]; words: string[] }[] {
  const verbs = ASPECTS.map((a) => render({ ...state, aspect: a, focus: "actor", mood: "statement", polarity: "affirmative" }).parts.find((p) => p.dimension === "verb")!.text.toLowerCase());
  const objVerbs = ASPECTS.map((a) => render({ ...state, aspect: a, focus: "object", object: state.object ?? FOOD[0], mood: "statement", polarity: "affirmative" }).parts.find((p) => p.dimension === "verb")!.text.toLowerCase());
  const bank: { label: string; role: SentencePart["dimension"]; words: string[] }[] = [
    { label: "verb · actor focus", role: "verb", words: verbs },
  ];
  if (state.focus === "object" || state.questionWord === "ano") bank.push({ label: "verb · object focus", role: "verb", words: objVerbs });
  bank.push({ label: "who", role: "actor", words: ["ako", "ka", "siya", "kami", "tayo", "kayo", "sila"] });
  if (state.focus === "object" || state.questionWord === "ano") bank.push({ label: "who · ng-form", role: "actor", words: ["ko", "mo", "niya", "namin", "natin", "ninyo", "nila"] });
  bank.push({ label: "marker", role: "particle", words: ["ng", "ang"] });
  bank.push({ label: "what", role: "object", words: (state.root === ROOT ? FOOD : getNounsForVerb(state.root)).slice(0, 8) });
  bank.push({ label: "when", role: "time", words: [...TIME_KEYS] });
  bank.push({ label: "particles", role: "question", words: ["hindi", "ba", ...WH] });
  return bank;
}
