// Deep End: the maps with the labels removed. Nothing here is new content — every item is drawn
// from an existing generator or table (verb map, particle lab, roots, question drill, stories, lab
// sentences). The prompt never says which system it comes from; `meta` remembers, for diagnostics.

import { ASPECTS, nextSwap, type Aspect } from "./verbs";
import { ROWS, ROW_LABEL, VOICE_LABEL, labSentence, patternAt, type LabRoot, type Voice } from "./verbLab";
import { PARTICLE_CELLS } from "@/content/particles";
import { STORIES } from "@/content/stories";
import { nextQuestion, shuffle } from "./exercises";

export type Level = 1 | 2 | 3;
export type Source = "verb" | "particle" | "root" | "question" | "sentence";

export interface DeepMeta {
  source: Source;
  root?: string;
  family?: string;      // actor family of the root (um / mag / ma)
  voice?: Voice | "either";
  aspect?: Aspect;
  particle?: string;
  question?: string;    // "yes_no" | "ano" | "sino" | …
  area: string;         // human label used by diagnostics: "MAG- · object voice", "na ↔ pa", …
  link: string;         // where to go to practice this area
}

export interface DeepItem {
  id: string;
  level: Level;
  kind: "type" | "choose";
  main: string;          // big text
  sub?: string;          // under it (meaning / context)
  ask: string;           // quiet instruction — never a system label
  answers: string[];     // accepted answers (loose match)
  options?: string[];    // for "choose": 4 options, one of which is in answers
  show: string;          // canonical answer to reveal
  showEn?: string;
  meta: DeepMeta;
}

/* ---------------- matching ---------------- */
export const loose = (s: string) =>
  s.toLowerCase().replace(/[.,!?'’"“”]/g, "").replace(/\s+/g, " ").trim().replace(/\brin\b/g, "din").replace(/\braw\b/g, "daw");
export const matches = (answer: string, item: DeepItem) => item.answers.some((a) => loose(a) === loose(answer));

/* ---------------- shared: the 36 roots of the verb map ---------------- */
const MAP_ROOTS: { root: LabRoot; family: string }[] = ROWS.flatMap((row) => (patternAt(row, "actor")?.roots ?? []).map((root) => ({ root, family: row })));

const ASPECT_ASK: Record<Aspect, string> = {
  completed: "it already happened",
  ongoing: "it's happening right now",
  contemplated: "it hasn't happened yet",
};

/* ---------------- Level 1 · Forms ----------------
   ROOT + meaning + how far along, no family, no voice. When the prompt doesn't fix the voice,
   every validated form for that aspect is accepted. */
export function formItems(): DeepItem[] {
  const out: DeepItem[] = [];
  for (const { root: r, family } of MAP_ROOTS) {
    for (const aspect of ASPECTS) {
      const forms = (["actor", "object"] as Voice[]).map((v) => r.voices[v]?.forms[ASPECTS.indexOf(aspect)]).filter((f): f is string => !!f);
      if (!forms.length) continue;
      out.push({
        id: `form:${r.root}:${aspect}`, level: 1, kind: "type",
        main: r.root.toUpperCase(), sub: r.english, ask: ASPECT_ASK[aspect],
        answers: forms, show: forms.join("  ·  "),
        meta: { source: "verb", root: r.root, family, voice: forms.length > 1 ? "either" : r.voices.actor ? "actor" : "object", aspect, area: `${ROW_LABEL[family as keyof typeof ROW_LABEL]} · ${ASPECT_ASK[aspect]}`, link: "/verbs/" },
      });
    }
  }
  return out;
}

/* ---------------- Level 2 · Systems ---------------- */
function particleItems(): DeepItem[] {
  return PARTICLE_CELLS.flatMap((c) => c.items.map((it, k) => ({
    id: `particle:${c.id}:${k}`, level: 2 as Level, kind: "type" as const,
    main: it.base, sub: it.baseEn, ask: `make it mean: ${it.outEn}`,
    answers: [it.out], show: it.out, showEn: it.outEn,
    meta: { source: "particle" as Source, particle: c.id, area: c.label, link: "/particles/" },
  })));
}
const meaningsOf = (r: LabRoot) => r.english.split(" (")[0].split(" / ").map((m) => m.trim());
function rootItems(): DeepItem[] {
  return MAP_ROOTS.flatMap(({ root: r, family }) => [
    { id: `root:tl:${r.root}`, level: 2 as Level, kind: "type" as const, main: r.root.toUpperCase(), ask: "what does it mean?", answers: meaningsOf(r).flatMap((m) => [m, `to ${m}`]), show: r.english,
      meta: { source: "root" as Source, root: r.root, family, area: "root meanings", link: "/verbs/" } },
    { id: `root:en:${r.root}`, level: 2 as Level, kind: "type" as const, main: r.english, ask: "the root?", answers: [r.root], show: r.root,
      meta: { source: "root" as Source, root: r.root, family, area: "root meanings", link: "/verbs/" } },
  ]);
}
function questionItems(n: number): DeepItem[] {
  const out: DeepItem[] = [];
  for (let i = 0; i < n; i++) {
    const q = nextQuestion("mixed");
    if (!q.from) continue;
    const qw = q.state.questionWord ?? "yes_no";
    // The renderer puts `ba` after the pronoun for every pronoun ("Kumain ako ba"), which is only right for
    // the one-syllable `ka` ("Kumain ka ba"); the others need "Kumain ba ako". Until the renderer is fixed,
    // Deep End only uses yes/no questions with `ka`. (Reported; the fix belongs in src/languages/tagalog/renderer.ts.)
    if (qw === "yes_no" && q.state.actor !== "ikaw") continue;
    out.push({
      id: `question:${i}:${q.target.tagalog}`, level: 2, kind: "type",
      main: q.from.tagalog, sub: q.from.english, ask: (q.instruction ?? "make it a question").toLowerCase(),
      answers: [q.target.tagalog], show: q.target.tagalog, showEn: q.target.english,
      meta: { source: "question", root: q.state.root, aspect: q.state.aspect as Aspect, question: qw, area: qw === "yes_no" ? "yes / no questions" : `${qw} questions`, link: "/questions/" },
    });
  }
  return out;
}
function swapItems(n: number): DeepItem[] {
  const out: DeepItem[] = [];
  for (let i = 0; i < n; i++) {
    const s = nextSwap();
    out.push({
      id: `swap:${i}:${s.to.tagalog}`, level: 2, kind: "type",
      main: s.from.tagalog, sub: s.fromEn, ask: `make it mean: ${s.toEn}`,
      answers: [s.to.tagalog], show: s.to.tagalog, showEn: s.toEn,
      meta: { source: "verb", root: s.toRoot, family: s.verb.family === "in" ? undefined : s.verb.family, voice: s.verb.focus, aspect: s.aspect, area: `${VOICE_LABEL[s.verb.focus].name} · same shape, new root`, link: "/verbs/" },
    });
  }
  return out;
}

/* ---------------- Level 3 · Sentences ----------------
   Validated natural sentences only: story lines (both directions) and lab sentences (Tagalog → English, choose).
   English → Tagalog uses story glosses and particle meanings, never article-driven glosses. */
const stripQuotes = (s: string) => s.replace(/^["“]+|["”]+$/g, "").trim();
function storyLines() {
  return STORIES.flatMap((st) => st.lines.map((l) => ({ tl: stripQuotes(l.text), en: stripQuotes(l.gloss), story: st.title, level: st.level })))
    .filter((l) => l.tl.split(" ").length <= 7 && !/[:;]/.test(l.tl));
}
function sentenceItems(): DeepItem[] {
  const lines = storyLines();
  const out: DeepItem[] = [];
  const glosses = lines.map((l) => l.en);
  lines.forEach((l, k) => {
    out.push({ id: `story:en-tl:${k}`, level: 3, kind: "type", main: l.en, ask: "in Tagalog", answers: [l.tl], show: l.tl, showEn: l.en,
      meta: { source: "sentence", area: `stories · ${l.story}`, link: "/library/stories/" } });
    const others = shuffle(glosses.filter((g) => g !== l.en)).slice(0, 3);
    out.push({ id: `story:tl-en:${k}`, level: 3, kind: "choose", main: l.tl, ask: "what does it mean?", answers: [l.en], options: shuffle([l.en, ...others]), show: l.en,
      meta: { source: "sentence", area: `stories · ${l.story}`, link: "/library/stories/" } });
  });
  // lab sentences: the verb map's own sentences, recognized rather than produced (their English is generated).
  const labs: { tl: string; en: string; meta: DeepMeta }[] = [];
  for (const { root: r, family } of MAP_ROOTS) for (const v of ["actor", "object"] as Voice[]) for (const aspect of ASPECTS) {
    const s = labSentence(r, aspect, v, ["ako", "siya", "kami", "sila"][Math.floor(Math.random() * 4)], true);
    if (s) labs.push({ tl: s.tl, en: s.en, meta: { source: "verb", root: r.root, family, voice: v, aspect, area: `${ROW_LABEL[family as keyof typeof ROW_LABEL]} · ${VOICE_LABEL[v].name.toLowerCase()}`, link: "/verbs/" } });
  }
  const labEn = labs.map((l) => l.en);
  labs.forEach((l, k) => {
    const others = shuffle(labEn.filter((g) => g !== l.en)).slice(0, 3);
    out.push({ id: `lab:tl-en:${k}`, level: 3, kind: "choose", main: l.tl, ask: "what does it mean?", answers: [l.en], options: shuffle([l.en, ...others]), show: l.en, meta: l.meta });
  });
  // particle sentences, English → Tagalog: the English already carries the framing.
  for (const c of PARTICLE_CELLS) c.items.forEach((it, k) => out.push({
    id: `psent:${c.id}:${k}`, level: 3, kind: "type", main: it.outEn, ask: "in Tagalog", answers: [it.out], show: it.out, showEn: it.outEn,
    meta: { source: "particle", particle: c.id, area: c.label, link: "/particles/" },
  }));
  return out;
}

/* ---------------- a run ---------------- */
export const LEVELS: { level: Level; name: string; what: string; count: number }[] = [
  { level: 1, name: "Forms", what: "A root and how far along it is. You pick the pattern.", count: 20 },
  { level: 2, name: "Systems", what: "Verbs, particles, roots, questions — shuffled, unlabeled.", count: 24 },
  { level: 3, name: "Sentences", what: "Whole sentences, both directions, from the stories and the labs.", count: 20 },
];

export function buildRun(level: Level): DeepItem[] {
  const n = LEVELS.find((l) => l.level === level)!.count;
  if (level === 1) return shuffle(formItems()).slice(0, n);
  if (level === 2) {
    // balanced: a quarter each of forms, particles, roots, sentence transformations (questions + voice swaps)
    const q = Math.ceil(n / 4);
    return shuffle([
      ...shuffle(formItems()).slice(0, q),
      ...shuffle(particleItems()).slice(0, q),
      ...shuffle(rootItems()).slice(0, q),
      ...shuffle([...questionItems(q), ...swapItems(q)]).slice(0, q),
    ]);
  }
  return shuffle(sentenceItems()).slice(0, n);
}

export const POOL_SIZE: Record<Level, () => number> = {
  1: () => formItems().length,
  2: () => formItems().length + particleItems().length + rootItems().length,
  3: () => sentenceItems().length,
};

/* ---------------- diagnostics ---------------- */
export interface Attempt { item: DeepItem; correct: boolean; ms: number }   // first attempt only
export interface Report {
  accuracy: number;                       // 0–1
  total: number;
  medianMs: number | null;                // correct first attempts only
  needsWork: { area: string; link: string; misses: number }[];
  slowest: { area: string; medianMs: number } | null;
}
const median = (xs: number[]) => { if (!xs.length) return null; const s = [...xs].sort((a, b) => a - b); const m = Math.floor(s.length / 2); return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
export function report(attempts: Attempt[]): Report {
  const total = attempts.length;
  const correct = attempts.filter((a) => a.correct);
  const byArea = new Map<string, { link: string; misses: number; ms: number[] }>();
  for (const a of attempts) {
    const e = byArea.get(a.item.meta.area) ?? { link: a.item.meta.link, misses: 0, ms: [] };
    if (a.correct) e.ms.push(a.ms); else e.misses++;
    byArea.set(a.item.meta.area, e);
  }
  const needsWork = [...byArea.entries()].filter(([, e]) => e.misses > 0).sort((x, y) => y[1].misses - x[1].misses).slice(0, 3).map(([area, e]) => ({ area, link: e.link, misses: e.misses }));
  const slow = [...byArea.entries()].map(([area, e]) => ({ area, medianMs: median(e.ms) })).filter((x): x is { area: string; medianMs: number } => x.medianMs !== null && x.medianMs > 0).sort((x, y) => y.medianMs - x.medianMs)[0] ?? null;
  return { accuracy: total ? correct.length / total : 0, total, medianMs: median(correct.map((a) => a.ms)), needsWork, slowest: slow };
}
