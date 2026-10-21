// Checking a typed Tagalog sentence against curated accepted answers.
// Deterministic and conservative: exact match → correct; a word or two off → almost;
// anything further → needs review (we show the reference rather than judge it).
//
// Persistence: which sentences are done and where the learner left off.

import { CONNECTORS, type Context, type Join, type PracticeMode, type Step, type Target, type Vocab } from "@/content/sentences";

/* ---------------- Normalization ---------------- */

/** Lowercase, drop punctuation and hyphens, collapse whitespace. "Nag-aaral" and "nagaaral" are equal. */
export const normalize = (s: string) =>
  s.toLowerCase().replace(/[.,!?;:"'“”‘’()]/g, "").replace(/-/g, "").replace(/\s+/g, " ").trim();

const tokens = (s: string) => normalize(s).split(" ").filter(Boolean);

/* ---------------- Alignment ---------------- */

export type Op =
  | { kind: "keep"; text: string }
  | { kind: "sub"; from: string; to: string; typo: boolean }
  | { kind: "extra"; text: string }     // in the answer, not in the reference
  | { kind: "missing"; text: string };  // in the reference, not in the answer

/** Character edit distance. Used to tell a typo from a different word. */
function charDistance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}

const isTypo = (a: string, b: string) => a !== b && Math.min(a.length, b.length) >= 4 && charDistance(a, b) <= 2;

/** Word-level alignment of answer → reference with backtrace. Returns ops in reading order and the distance. */
export function align(answer: string, reference: string): { ops: Op[]; distance: number; length: number } {
  const a = tokens(answer), r = tokens(reference);
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(r.length).fill(0)]);
  for (let j = 1; j <= r.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= r.length; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === r[j - 1] ? 0 : 1));

  const ops: Op[] = [];
  let i = a.length, j = r.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === r[j - 1] && d[i][j] === d[i - 1][j - 1]) { ops.push({ kind: "keep", text: a[i - 1] }); i--; j--; }
    else if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + 1) { ops.push({ kind: "sub", from: a[i - 1], to: r[j - 1], typo: isTypo(a[i - 1], r[j - 1]) }); i--; j--; }
    else if (i > 0 && d[i][j] === d[i - 1][j] + 1) { ops.push({ kind: "extra", text: a[i - 1] }); i--; }
    else { ops.push({ kind: "missing", text: r[j - 1] }); j--; }
  }
  ops.reverse();
  return { ops, distance: d[a.length][r.length], length: r.length };
}

/* ---------------- Verdict ---------------- */

export type Verdict = "correct" | "almost" | "review";

export interface Evaluation {
  verdict: Verdict;
  reference: string;   // the accepted answer the attempt was closest to (display form)
  ops: Op[];           // alignment against that reference
  corrections: Correction[];
}

export interface Correction {
  from?: string;       // what was written (absent when a word was missing)
  to?: string;         // what the reference has (absent when a word was extra)
  explain: string;     // one line: "AKO = Aku", "spelling", "not needed here"
}

/** Small glossary for words that recur in every sentence and are rarely in a sentence's own vocabulary. */
const GLOSS: Record<string, string> = {
  ako: "Aku", ka: "Kamu", ikaw: "Kamu", siya: "Dia", kami: "Kami (tanpa kamu)", tayo: "Kita (termasuk kamu)", kayo: "Kalian", sila: "Mereka",
  ko: "-ku (aku, sebagai pelaku)", mo: "-mu (kamu, sebagai pelaku)", niya: "-nya (dia)", natin: "kita (sebagai pelaku)", namin: "kami (sebagai pelaku)",
  akong: "ako + ng", kang: "ka + ng", siyang: "siya + ng",
  ang: "penanda fokus (ang)", ng: "penanda non-fokus (ng)", sa: "ke / di / dari (sa)",
  hindi: "Tidak / nggak", wala: "Tidak ada", may: "Ada / punya", pa: "Masih / belum",
  ito: "Ini", iyon: "Itu", dito: "Di sini", doon: "Di sana",
  bukas: "Besok", kahapon: "Kemarin", ngayon: "Sekarang", mamaya: "Nanti",
};

/** Every known Tagalog → Indonesian pair for this clause, keyed by normalized word or phrase. */
function glossFor(ctx: Context): Map<string, string> {
  const m = new Map<string, string>(Object.entries(GLOSS).map(([k, v]) => [normalize(k), v]));
  for (const key of ctx.connectors) { const c = CONNECTORS[key]; if (c) m.set(normalize(c.word), c.meaning); }
  for (const v of ctx.vocabulary) m.set(normalize(v.tagalog), v.indonesian);
  return m;
}

function explain(op: Op, gloss: Map<string, string>): Correction | null {
  if (op.kind === "keep") return null;
  if (op.kind === "sub") {
    if (op.typo) return { from: op.from, to: op.to, explain: "spelling" };
    const g = gloss.get(op.to);
    return { from: op.from, to: op.to, explain: g ? `${op.to.toUpperCase()} = ${g}` : `${op.to.toUpperCase()} is what the sentence needs here` };
  }
  if (op.kind === "missing") {
    const g = gloss.get(op.text);
    return { to: op.text, explain: g ? `missing ${op.text.toUpperCase()} = ${g}` : `missing ${op.text.toUpperCase()}` };
  }
  return { from: op.text, explain: `${op.text.toUpperCase()} is not needed here` };
}

/** All accepted forms for a target: the display sentence plus curated alternates. */
export function acceptedFor(target: Target): string[] {
  return [target.tagalog, ...(target.acceptedAnswers ?? [])];
}

/**
 * Evaluate a typed answer. `almost` allows one wrong word, or 20% of the words on longer sentences.
 * Beyond that we do not claim the answer is wrong; we show the reference and mark it for review.
 */
export function evaluate(answer: string, target: Target, ctx: Context): Evaluation {
  const accepted = acceptedFor(target);
  const norm = normalize(answer);
  const exact = accepted.find((t) => normalize(t) === norm);
  if (exact) return { verdict: "correct", reference: exact, ops: tokens(exact).map((t) => ({ kind: "keep", text: t })), corrections: [] };

  // "Gusto kong kape": the spoken form. In writing the object marker stays apart from the pronoun: ko ng kape.
  // kong / mong (pronoun + linker) belong before a verb or adjective: gusto kong kumain.
  const spoken = norm.replace(/\b(ko|mo|niya|namin|natin|ninyo|nila)ng\b/g, "$1 ng");
  if (spoken !== norm) {
    const ref = accepted.find((t) => normalize(t) === spoken);
    if (ref) {
      const m = norm.match(/\b(ko|mo|niya|namin|natin|ninyo|nila)ng\b/)!;
      return {
        verdict: "almost", reference: ref, ops: align(answer, ref).ops,
        corrections: [{ from: m[0], to: `${m[1]} ng`, explain: `ng marks the thing (kape), written apart. ${m[0]} = ${m[1]} + linker, used before a verb: gusto ${m[0]} kumain` }],
      };
    }
  }

  let best: { ref: string; a: ReturnType<typeof align> } | null = null;
  for (const ref of accepted) {
    const a = align(answer, ref);
    if (!best || a.distance < best.a.distance) best = { ref, a };
  }
  const { ref, a } = best!;
  const allowed = Math.max(1, Math.round(a.length * 0.2));
  const verdict: Verdict = a.distance <= allowed ? "almost" : "review";
  const gloss = glossFor(ctx);
  // Past half the sentence, listing corrections is noise; the reference says more.
  const corrections = a.distance <= a.length / 2 ? a.ops.map((op) => explain(op, gloss)).filter((c): c is Correction => c !== null) : [];
  return { verdict, reference: ref, ops: a.ops, corrections };
}

/* ---------------- Sentence rendering helpers ---------------- */

export interface Segment { text: string; connector?: string; trailing: string }

/**
 * Split a sentence into word segments, tagging the ones that belong to a listed connector.
 * Multi-word connectors ("galing sa", "na lang") are matched longest first so "na" inside "na lang" is not double-tagged.
 */
export function segment(tagalog: string, connectorKeys: string[]): Segment[] {
  const words = tagalog.split(/\s+/).filter(Boolean);
  const core = words.map((w) => normalize(w));
  const trailing = words.map((w) => (w.match(/[.,!?;:]+$/) ?? [""])[0]);
  const tag: (string | undefined)[] = Array(words.length).fill(undefined);
  const phrases = connectorKeys
    .map((key) => ({ key, parts: tokens(CONNECTORS[key]?.word ?? "") }))
    .filter((p) => p.parts.length > 0)
    .sort((x, y) => y.parts.length - x.parts.length);
  for (const { key, parts } of phrases) {
    let found = false;
    for (let i = 0; i + parts.length <= core.length; i++) {
      if (tag.slice(i, i + parts.length).some(Boolean)) continue;
      if (parts.every((p, k) => core[i + k] === p)) { for (let k = 0; k < parts.length; k++) tag[i + k] = key; found = true; }
    }
    // "Galing ako sa opisina": the actor sits inside the phrase. Allow a short gap when nothing contiguous matched.
    if (!found && parts.length > 1) {
      for (let i = 0; i < core.length; i++) {
        if (tag[i] || core[i] !== parts[0]) continue;
        const hit = [i];
        for (let k = 1, from = i + 1; k < parts.length; k++) {
          const j = core.slice(from, from + 3).findIndex((w, off) => w === parts[k] && !tag[from + off]);
          if (j < 0) break;
          hit.push(from + j); from = from + j + 1;
        }
        if (hit.length === parts.length) { for (const h of hit) tag[h] = key; break; }
      }
    }
  }
  return words.map((w, i) => ({ text: trailing[i] ? w.slice(0, -trailing[i].length) : w, connector: tag[i], trailing: trailing[i] }));
}

/* ---------------- Indonesian prompt: tap a word for its Tagalog ---------------- */

export interface IdSegment { text: string; trailing: string; vocab?: Vocab }

/** Pronouns and the few words every prompt uses, so they are tappable without being listed in each sentence. */
const ID_BASE: Vocab[] = [
  { tagalog: "ako", indonesian: "aku" }, { tagalog: "ka", indonesian: "kamu" }, { tagalog: "siya", indonesian: "dia" },
  { tagalog: "tayo", indonesian: "kita" }, { tagalog: "kami", indonesian: "kami" }, { tagalog: "sila", indonesian: "mereka" },
  { tagalog: "hindi", indonesian: "tidak / nggak" }, { tagalog: "wala", indonesian: "tidak ada" }, { tagalog: "may", indonesian: "ada" },
  { tagalog: "bukas", indonesian: "besok" }, { tagalog: "mamaya", indonesian: "nanti" }, { tagalog: "ngayon", indonesian: "sekarang" },
  { tagalog: "sa", indonesian: "ke / di" }, { tagalog: "at", indonesian: "dan" }, { tagalog: "ito", indonesian: "ini" }, { tagalog: "iyon", indonesian: "itu" },
];

/** Every Indonesian form a vocab entry can be tapped as: "tidak / nggak" → both; "pulang (sudah)" → "pulang". */
const idForms = (v: Vocab) => v.indonesian.replace(/\([^)]*\)/g, "").split("/").map((x) => tokens(x.replace(/^-/, ""))).filter((t) => t.length > 0);

/** "temanku" = teman + -ku. The Tagalog gets the matching possessive: kaibigan ko. (-nya is left alone: it is often just "the".) */
const POSSESSIVE: Record<string, string> = { ku: "ko", mu: "mo" };
const splitPossessive = (w: string) => { const m = w.match(/^(.{3,}?)(ku|mu)$/); return m ? { base: m[1], suffix: m[2] } : null; };

/**
 * Split an Indonesian sentence into words, attaching the vocab entry whose Indonesian covers each word.
 * Sentence-specific vocabulary wins over the base list; longer phrases ("akan minum") win over single words.
 */
export function segmentIndonesian(text: string, vocab: Vocab[]): IdSegment[] {
  const words = text.split(/\s+/).filter(Boolean);
  const core = words.map((w) => normalize(w));
  const trailing = words.map((w) => (w.match(/[.,!?;:]+$/) ?? [""])[0]);
  const tag: (Vocab | undefined)[] = Array(words.length).fill(undefined);
  const forms = [...vocab, ...ID_BASE].flatMap((v) => idForms(v).map((parts) => ({ v, parts })));
  forms.sort((x, y) => y.parts.length - x.parts.length);
  for (const { v, parts } of forms) {
    for (let i = 0; i + parts.length <= core.length; i++) {
      if (tag.slice(i, i + parts.length).some(Boolean)) continue;
      const last = parts.length - 1;
      if (!parts.slice(0, last).every((p, k) => core[i + k] === p)) continue;
      let hit: Vocab | null = null;
      if (core[i + last] === parts[last]) hit = v;
      else {
        const s = splitPossessive(core[i + last]);
        if (s && s.base === parts[last]) hit = { ...v, tagalog: `${v.tagalog} ${POSSESSIVE[s.suffix]}` };
      }
      if (hit) for (let k = 0; k < parts.length; k++) tag[i + k] = hit;
    }
  }
  return words.map((w, i) => ({ text: trailing[i] ? w.slice(0, -trailing[i].length) : w, trailing: trailing[i], vocab: tag[i] }));
}

/* ---------------- Passage composition ---------------- */

const strip = (s: string) => s.trim().replace(/[.,!?]+$/, "");
const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** Join clauses the way their steps say: new sentence, after a comma, or straight on. */
export function composeClauses(clauses: string[], joins: Join[]): string {
  let out = "";
  clauses.forEach((c, i) => {
    const clause = strip(c);
    if (!clause) return;
    if (!out) out = clause;
    else if (joins[i] === "new") out += `. ${clause}`;
    else if (joins[i] === "comma") out += `, ${lowerFirst(clause)}`;
    else out += ` ${lowerFirst(clause)}`;
  });
  return out ? `${out}.` : "";
}

/** The passage after the first `upTo` steps, in either language. */
export function composePassage(steps: Step[], upTo = steps.length, lang: "tagalog" | "indonesian" = "tagalog"): string {
  const used = steps.slice(0, upTo);
  return composeClauses(used.map((s) => s[lang]), used.map((s) => s.join));
}

/** Every accepted full passage: each step's alternates combined, capped so the product stays small. */
export function passageAccepted(steps: Step[], cap = 64): string[] {
  let combos: string[][] = [[]];
  for (const s of steps) {
    const next: string[][] = [];
    for (const c of combos) for (const alt of acceptedFor(s)) { if (next.length >= cap) break; next.push([...c, alt]); }
    combos = next;
  }
  const joins = steps.map((s) => s.join);
  return [...new Set(combos.map((c) => composeClauses(c, joins)))];
}

/** Everything the whole passage is made of, for the glossary when checking the final challenge. */
export function passageContext(steps: Step[]): Context {
  return { connectors: [...new Set(steps.flatMap((s) => s.connectors))], vocabulary: steps.flatMap((s) => s.vocabulary) };
}

/* ---------------- Persistence ---------------- */

const KEY = "tagalog.journeys.v1";
export interface JourneyProgress {
  done: string[];                                   // journeys whose sentence was built
  practiced: Record<string, PracticeMode[]>;        // per journey: practice modes finished
}

const EMPTY: JourneyProgress = { done: [], practiced: {} };

export function readProgress(): JourneyProgress {
  if (typeof window === "undefined") return EMPTY;
  try {
    const p = JSON.parse(localStorage.getItem(KEY) || "null");
    if (p && Array.isArray(p.done)) {
      const practiced: Record<string, PracticeMode[]> = {};
      if (p.practiced && typeof p.practiced === "object") {
        for (const [id, modes] of Object.entries(p.practiced)) if (Array.isArray(modes)) practiced[id] = modes.filter((m): m is PracticeMode => m === "substitute" || m === "recombine" || m === "create");
      }
      return { done: p.done.filter((d: unknown) => typeof d === "string"), practiced };
    }
  } catch {}
  return EMPTY;
}

export function writeProgress(p: JourneyProgress) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {}
}
