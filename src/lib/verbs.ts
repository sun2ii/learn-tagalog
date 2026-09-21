// Verb drills. The one idea: form = root + family + aspect.
// Roots and forms come from the Vocabulary tables; sentences come from the language renderer.
import { VOCAB, type VocabEntry } from "@/content/vocab";
import { VERBS } from "@/languages/tagalog/verbs";
import { getNounsForVerb } from "@/languages/tagalog/nouns";
import { PRONOUN_KEYS } from "@/languages/tagalog/pronouns";
import { render, type RenderedSentence } from "@/languages/tagalog/renderer";
import type { SentenceState } from "@/engine/types";
import { englishFor } from "./english";

export type Family = "um" | "mag" | "ma" | "in";
export type Aspect = "contemplated" | "ongoing" | "completed";
export const ASPECTS: Aspect[] = ["contemplated", "ongoing", "completed"];
export const ASPECT_LABEL: Record<Aspect, string> = { contemplated: "not yet · 0", ongoing: "ongoing · ½", completed: "done · 1" };
export const FAMILY_LABEL: Record<Family, string> = { um: "-um-", mag: "mag-", ma: "ma-", in: "-in- · object focus" };

export interface Verb { root: string; meaning: string; family: Family; forms: [string, string, string]; ex?: string; exEn?: string; focus: "actor" | "object" }

const FAMILY_OF_GROUP: Record<string, Family> = { "verbs-um": "um", "verbs-mag": "mag", "verbs-ma": "ma", "verbs-in": "in" };

export const VERB_LIST: Verb[] = VOCAB.flatMap((g) => {
  const fam = FAMILY_OF_GROUP[g.id];
  if (!fam) return [];
  return g.words.filter((w): w is VocabEntry & { forms: [string, string, string] } => !!w.forms)
    .map((w) => ({ root: w.t, meaning: w.m.replace(" (object focus)", ""), family: fam, forms: w.forms, ex: w.ex, exEn: w.exEn, focus: fam === "in" ? "object" as const : "actor" as const }));
});

export function verbsFor(family: Family | "all"): Verb[] {
  return family === "all" ? VERB_LIST : VERB_LIST.filter((v) => v.family === family);
}

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];
function shuffle<T>(arr: readonly T[]): T[] {
  const r = [...arr];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

/* How a form is built, in pieces – shown after an answer so the mechanism is visible. */
export function mechanism(v: Verb, aspect: Aspect): string {
  const form = v.forms[ASPECTS.indexOf(aspect)];
  const r = v.root;
  if (v.family === "um") {
    if (aspect === "completed") return `${r} → ${form}: -um- slips in after the first consonant. No doubling = done.`;
    if (aspect === "ongoing") return `${r} → ${form}: -um- in, AND the first syllable doubled = still going.`;
    return `${r} → ${form}: first syllable doubled, no -um- yet = not started.`;
  }
  if (v.family === "mag") {
    if (aspect === "completed") return `${r} → ${form}: mag- becomes nag- once the action has started. No doubling = done.`;
    if (aspect === "ongoing") return `${r} → ${form}: nag- (started) + doubled first syllable (not finished).`;
    return `${r} → ${form}: mag- (not started) + doubled first syllable.`;
  }
  if (v.family === "in") {
    if (aspect === "completed") return `${r} → ${form}: -in- inside the root (after the first consonant) = done, thing in focus. The eater is ko/mo/niya, the thing takes ang.`;
    if (aspect === "ongoing") return `${r} → ${form}: -in- inside + doubled syllable = still going, thing in focus.`;
    return `${r} → ${form}: doubled syllable + -in ending (no -in- inside yet) = not started, thing in focus.`;
  }
  if (aspect === "completed") return `${r} → ${form}: ma- becomes na- once started. No doubling = done.`;
  if (aspect === "ongoing") return `${r} → ${form}: na- (started) + doubled syllable (not finished).`;
  return `${r} → ${form}: ma- (not started) + doubled syllable.`;
}

/* ---------------- The rules, as operations ----------------
   Every form is: root → (double the first syllable?) → (which affix?).
   Doubling is the same everywhere: 0 and ½ double, 1 doesn't.
   The affix flips once the action has started: mag→nag, ma→na, -in ending → -in- inside, and -um- appears. */

export type Affix = "none" | "um" | "mag" | "nag" | "ma" | "na" | "in-inside" | "in-ending";
export const AFFIX_LABEL: Record<Affix, string> = { none: "no affix", um: "-um- inside", mag: "mag- in front", nag: "nag- in front", ma: "ma- in front", na: "na- in front", "in-inside": "-in- inside", "in-ending": "-in at the end" };

export const RULES: Record<Family, Record<Aspect, { double: boolean; affix: Affix }>> = {
  um:  { contemplated: { double: true, affix: "none" },      ongoing: { double: true, affix: "um" },          completed: { double: false, affix: "um" } },
  mag: { contemplated: { double: true, affix: "mag" },       ongoing: { double: true, affix: "nag" },         completed: { double: false, affix: "nag" } },
  ma:  { contemplated: { double: true, affix: "ma" },        ongoing: { double: true, affix: "na" },          completed: { double: false, affix: "na" } },
  in:  { contemplated: { double: true, affix: "in-ending" }, ongoing: { double: true, affix: "in-inside" },   completed: { double: false, affix: "in-inside" } },
};
/** Which affixes are even on the table for a family (the choices the drill offers). */
export const AFFIX_CHOICES: Record<Family, Affix[]> = { um: ["none", "um"], mag: ["mag", "nag", "none"], ma: ["ma", "na", "none"], in: ["in-ending", "in-inside", "none"] };

const V = "aeiou";
/** The syllable that gets doubled: first consonant (one, clusters drop) + first vowel. kain→ka · inom→i · trabaho→ta */
export function firstSyllable(root: string): string {
  const m = root.match(/^([^aeiou])?[^aeiou]*([aeiou])/);
  return m ? (m[1] ?? "") + m[2] : root.slice(0, 2);
}
/** Naive assembly from the operations. Real forms sometimes add a sound change; we show both. */
export function assemble(root: string, double: boolean, affix: Affix): string {
  const base = double ? firstSyllable(root) + root : root;
  const vowelStart = V.includes(root[0]);
  switch (affix) {
    case "none": return base;
    case "um": return vowelStart ? "um" + base : base[0] + "um" + base.slice(1);
    case "in-inside": {
      if (vowelStart) return "in" + base;
      if ("lryw".includes(base[0])) return "ni" + base;   // l/r/y/w roots: -in- comes out as ni-
      return base[0] + "in" + base.slice(1);
    }
    case "in-ending": return base + (V.includes(base[base.length - 1]) ? "hin" : "in");
    default: return affix + (vowelStart && (affix === "mag" || affix === "nag") ? "-" : "") + base;   // mag-aaral, nag-aral
  }
}

/** The form as colored pieces: which letters are the affix, which are the doubled syllable, which are the root. */
export type Piece = { text: string; kind: "affix" | "double" | "root" };
export function pieces(root: string, double: boolean, affix: Affix): Piece[] {
  const syl = firstSyllable(root);
  const vowelStart = V.includes(root[0]);
  const dbl: Piece[] = double ? [{ text: syl, kind: "double" }] : [];
  const rt: Piece = { text: root, kind: "root" };
  const infix = (ins: string): Piece[] => {
    // goes after the first consonant of whatever comes first (the doubled syllable, or the root itself)
    if (vowelStart) return [{ text: ins, kind: "affix" }, ...dbl, rt];
    if (double) return [{ text: syl[0], kind: "double" }, { text: ins, kind: "affix" }, { text: syl.slice(1), kind: "double" }, rt];
    return [{ text: root[0], kind: "root" }, { text: ins, kind: "affix" }, { text: root.slice(1), kind: "root" }];
  };
  switch (affix) {
    case "none": return [...dbl, rt];
    case "um": return infix("um");
    case "in-inside": return "lryw".includes(root[0]) && !vowelStart ? [{ text: "ni", kind: "affix" }, ...dbl, rt] : infix("in");
    case "in-ending": return [...dbl, rt, { text: V.includes(root[root.length - 1]) ? "hin" : "in", kind: "affix" }];
    default: return [{ text: affix + (vowelStart && (affix === "mag" || affix === "nag") ? "-" : ""), kind: "affix" }, ...dbl, rt];
  }
}
/** Unique roots, with their actor-focus and (if any) object-focus entries. */
export function rootsWithBoth(): { root: string; actor?: Verb; object?: Verb }[] {
  const map = new Map<string, { root: string; actor?: Verb; object?: Verb }>();
  for (const v of VERB_LIST) {
    const e = map.get(v.root) ?? { root: v.root };
    if (v.focus === "object") e.object = v; else e.actor = v;
    map.set(v.root, e);
  }
  return [...map.values()];
}

/* ---------------- Exercise shapes ---------------- */

export interface ConjugateEx { kind: "verb"; sub: "conjugate"; verb: Verb; aspect: Aspect; answer: string; options: string[]; concept: string }
export interface RecognizeEx { kind: "verb"; sub: "recognize"; verb: Verb; aspect: Aspect; form: string; rootOptions: string[]; concept: string }
export interface SwapEx { kind: "verb"; sub: "swap"; from: RenderedSentence; fromEn: string; to: RenderedSentence; toEn: string; verb: Verb; toRoot: string; aspect: Aspect; state: SentenceState; concept: string }
export interface BuildEx { kind: "verb"; sub: "build"; verb: Verb; aspect: Aspect; rule: { double: boolean; affix: Affix }; answer: string; concept: string }
export type VerbEx = ConjugateEx | RecognizeEx | SwapEx | BuildEx;

export function nextBuildForm(family: Family | "all" = "all"): BuildEx {
  const pool = verbsFor(family);
  const verb = pick(pool);
  const aspect = pick(ASPECTS);
  return { kind: "verb", sub: "build", verb, aspect, rule: RULES[verb.family][aspect], answer: verb.forms[ASPECTS.indexOf(aspect)], concept: "aspect" };
}

export function nextConjugate(family: Family | "all" = "all"): ConjugateEx {
  const pool = verbsFor(family);
  const verb = pick(pool);
  const aspect = pick(ASPECTS);
  const answer = verb.forms[ASPECTS.indexOf(aspect)];
  // Options: the root's other two forms + the same aspect of two other roots in the same family (plausible confusions).
  const others = shuffle(pool.filter((v) => v.root !== verb.root && v.family === verb.family)).slice(0, 2).map((v) => v.forms[ASPECTS.indexOf(aspect)]);
  const options = shuffle([...verb.forms, ...others]);
  return { kind: "verb", sub: "conjugate", verb, aspect, answer, options, concept: "aspect" };
}

export function nextRecognize(family: Family | "all" = "all"): RecognizeEx {
  const pool = verbsFor(family);
  const verb = pick(pool);
  const aspect = pick(ASPECTS);
  const form = verb.forms[ASPECTS.indexOf(aspect)];
  const rootOptions = shuffle([verb.root, ...shuffle(pool.filter((v) => v.root !== verb.root)).slice(0, 3).map((v) => v.root)]);
  return { kind: "verb", sub: "recognize", verb, aspect, form, rootOptions, concept: "aspect" };
}

/* Swap: same sentence, different verb. Only roots the renderer knows with a compatible object. */
const SWAP_ROOTS = Object.keys(VERBS).filter((r) => VERBS[r].transitive && getNounsForVerb(r).length > 0);

const OF_ROOTS = SWAP_ROOTS.filter((r) => !!VERBS[r].objectFocus);

export function nextSwap(): SwapEx {
  const objectFocus = Math.random() < 0.35;
  const roots = objectFocus ? OF_ROOTS : SWAP_ROOTS;
  const fromRoot = pick(roots);
  const toRoot = pick(roots.filter((r) => r !== fromRoot));
  const aspect = pick(ASPECTS);
  const actor = pick(PRONOUN_KEYS);
  const fromState: SentenceState = { root: fromRoot, aspect, actor, focus: objectFocus ? "object" : "actor", object: pick(getNounsForVerb(fromRoot)) };
  const toState: SentenceState = { ...fromState, root: toRoot, object: pick(getNounsForVerb(toRoot)) };
  const fam: Family = objectFocus ? "in" : "um";
  const tv = VERBS[toRoot];
  const f = objectFocus && tv.objectFocus ? tv.objectFocus : tv.actorFocus;
  const verb = VERB_LIST.find((v) => v.root === toRoot && v.focus === (objectFocus ? "object" : "actor")) ?? { root: toRoot, meaning: tv.meaning, family: fam, forms: [f.contemplated, f.ongoing, f.completed] as [string, string, string], focus: objectFocus ? "object" as const : "actor" as const };
  return { kind: "verb", sub: "swap", from: render(fromState), fromEn: englishFor(fromState), to: render(toState), toEn: englishFor(toState), verb, toRoot, aspect, state: toState, concept: "aspect" };
}

export type VerbDrill = "build" | "conjugate" | "recognize" | "swap" | "mix";
export function nextVerbEx(kind: VerbDrill, family: Family | "all", i: number): VerbEx {
  const k = kind === "mix" ? (["build", "recognize", "conjugate", "swap"] as const)[i % 4] : kind;
  if (k === "build") return nextBuildForm(family);
  if (k === "conjugate") return nextConjugate(family);
  if (k === "recognize") return nextRecognize(family);
  return nextSwap();
}

export const normalize = (s: string) => s.toLowerCase().replace(/[.,!?]/g, "").replace(/\s+/g, " ").trim();
