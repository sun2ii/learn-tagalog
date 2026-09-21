// Slot engine: given the pieces already placed (in order), which pieces may
// come next? The templates below mirror the renderer's sentence patterns one
// for one, so the interface can only build what the renderer can say.

import type { SentencePart } from "@/languages/tagalog/renderer";
import { VERBS } from "@/languages/tagalog/verbs";
import { PRONOUNS } from "@/languages/tagalog/pronouns";
import { NOUNS } from "@/languages/tagalog/nouns";
import { TIME_EXPRESSIONS, isTimeCompatible } from "@/languages/tagalog/time";

type Role = SentencePart["dimension"];
export interface PieceLike { text: string; role?: Role }

/* ---- classify one word ---- */
type Kind =
  | { k: "V"; focus: "actor" | "object"; aspect: string }
  | { k: "ACT"; form: "ang" | "ng"; key: string }
  | { k: "MK"; m: "ng" | "ang" }
  | { k: "N" } | { k: "T"; key: string } | { k: "HINDI" } | { k: "BA" }
  | { k: "Q"; q: "ano" | "sino" | "circ" } | { k: "?" };

const norm = (t: string) => t.toLowerCase().replace(/[.,!?]/g, "");

export function kindOf(word: string): Kind {
  const t = norm(word);
  for (const v of Object.values(VERBS)) {
    for (const [aspect, form] of Object.entries(v.actorFocus)) if (form === t) return { k: "V", focus: "actor", aspect };
    if (v.objectFocus) for (const [aspect, form] of Object.entries(v.objectFocus)) if (form === t) return { k: "V", focus: "object", aspect };
  }
  for (const [key, p] of Object.entries(PRONOUNS)) {
    if (t === p.ang || (key === "ikaw" && t === "ka")) return { k: "ACT", form: "ang", key };
    if (t === p.ng) return { k: "ACT", form: "ng", key };
  }
  if (t === "ng" || t === "ang") return { k: "MK", m: t };
  if (NOUNS[t]) return { k: "N" };
  if (TIME_EXPRESSIONS[t]) return { k: "T", key: t };
  if (t === "hindi") return { k: "HINDI" };
  if (t === "ba") return { k: "BA" };
  if (t === "ano") return { k: "Q", q: "ano" };
  if (t === "sino") return { k: "Q", q: "sino" };
  if (["saan", "kailan", "bakit", "paano"].includes(t)) return { k: "Q", q: "circ" };
  return { k: "?" };
}

/* ---- templates ---- */
// Slot = a kind pattern. Optional groups are expanded into separate templates.
type Slot = "Vaf" | "Vof" | "ACTang" | "ACTng" | "MKng" | "MKang" | "N" | "T" | "HINDI" | "BA" | "Qano" | "Qsino" | "Qcirc";

function expand(parts: (Slot | Slot[])[]): Slot[][] {
  // an array item = optional group (all-or-nothing)
  let out: Slot[][] = [[]];
  for (const p of parts) {
    if (Array.isArray(p)) out = out.flatMap((seq) => [seq, [...seq, ...p]]);
    else out = out.map((seq) => [...seq, p]);
  }
  return out;
}

const TEMPLATES: Slot[][] = [
  // actor focus
  ...expand(["Vaf", "ACTang", ["MKng", "N"], ["T"]]),
  ...expand(["HINDI", "ACTang", "Vaf", ["MKng", "N"], ["T"]]),
  ...expand(["Vaf", "ACTang", "BA", ["MKng", "N"], ["T"]]),
  ...expand(["HINDI", "ACTang", "BA", "Vaf", ["MKng", "N"], ["T"]]),
  ...expand(["Qcirc", "ACTang", "Vaf", ["MKng", "N"], ["T"]]),
  ...expand(["Qsino", "MKang", "Vaf", ["MKng", "N"], ["T"]]),
  // object focus
  ...expand(["Vof", "ACTng", "MKang", "N", ["T"]]),
  ...expand(["HINDI", "ACTng", "Vof", "MKang", "N", ["T"]]),
  ...expand(["Vof", "ACTng", "BA", "MKang", "N", ["T"]]),
  ...expand(["HINDI", "ACTng", "BA", "Vof", "MKang", "N", ["T"]]),
  ...expand(["Qcirc", "ACTng", "Vof", "MKang", "N", ["T"]]),
  ...expand(["Qano", "MKang", "Vof", "ACTng", ["T"]]),
];

function slotOf(word: string): Slot | null {
  const k = kindOf(word);
  switch (k.k) {
    case "V": return k.focus === "actor" ? "Vaf" : "Vof";
    case "ACT": return k.form === "ang" ? "ACTang" : "ACTng";
    case "MK": return k.m === "ng" ? "MKng" : "MKang";
    case "N": return "N"; case "T": return "T"; case "HINDI": return "HINDI"; case "BA": return "BA";
    case "Q": return k.q === "ano" ? "Qano" : k.q === "sino" ? "Qsino" : "Qcirc";
    default: return null;
  }
}

const SLOT_NAME: Record<Slot, string> = {
  Vaf: "an actor-focus verb (kumain…)", Vof: "an object-focus verb (kinain…)",
  ACTang: "a who in ang-form (ako, ka…)", ACTng: "a who in ng-form (ko, mo…)",
  MKng: "ng", MKang: "ang", N: "a thing", T: "a time", HINDI: "hindi", BA: "ba",
  Qano: "ano", Qsino: "sino", Qcirc: "a question word",
};

/** Human list of what may come next, and whether the sentence can stop here. */
export function nextUp(placed: PieceLike[]): { next: string[]; complete: boolean } {
  const seq = placed.map((p) => slotOf(p.text));
  const matching = TEMPLATES.filter((t) => seq.every((s, i) => s !== null && t[i] === s));
  const complete = matching.some((t) => t.length === seq.length);
  const next = new Set<Slot>();
  matching.forEach((t) => { if (t.length > seq.length) next.add(t[seq.length]); });
  return { next: [...next].map((n) => SLOT_NAME[n]), complete };
}

export interface Verdict { allowed: boolean; reason?: string; complete: boolean }

/** For every candidate word, can it be the next piece? */
export function verdicts(placed: PieceLike[], candidates: string[]): Record<string, Verdict> {
  const seq = placed.map((p) => slotOf(p.text));
  const matching = TEMPLATES.filter((t) => seq.every((s, i) => s !== null && t[i] === s));
  const complete = matching.some((t) => t.length === seq.length);
  const next = new Set<Slot>();
  matching.forEach((t) => { if (t.length > seq.length) next.add(t[seq.length]); });

  const verbKind = placed.map((p) => kindOf(p.text)).find((k) => k.k === "V") as Extract<Kind, { k: "V" }> | undefined;
  const hasQ = placed.some((p) => kindOf(p.text).k === "Q");
  const qWord = placed.map((p) => norm(p.text)).find((t) => ["ano", "sino", "saan", "kailan", "bakit", "paano"].includes(t));
  const has = (s: Slot) => seq.includes(s);
  const placedNames = new Set(placed.map((p) => norm(p.text)));

  const out: Record<string, Verdict> = {};
  for (const w of candidates) {
    const s = slotOf(w);
    const k = kindOf(w);
    if (!s) { out[w] = { allowed: false, complete, reason: "Not part of this builder yet." }; continue; }
    if (placedNames.has(norm(w))) { out[w] = { allowed: false, complete, reason: "Already in the sentence. Each piece has one job." }; continue; }

    if (next.has(s)) {
      // slot fits; check the pair-level rules the templates can't see
      if (k.k === "T" && verbKind && !isTimeCompatible(k.key, verbKind.aspect)) {
        out[w] = { allowed: false, complete, reason: `${w} = ${TIME_EXPRESSIONS[k.key].english}: it needs a ${TIME_EXPRESSIONS[k.key].compatibleAspects.join(" / ")} verb, and you placed ${placed.find((p) => kindOf(p.text).k === "V")?.text}.` };
        continue;
      }
      if (k.k === "T" && qWord === "kailan") { out[w] = { allowed: false, complete, reason: "kailan already asks when — no time word needed." }; continue; }
      out[w] = { allowed: true, complete };
      continue;
    }

    // Not allowed: explain.
    out[w] = { allowed: false, complete, reason: reasonFor(s, k, seq, next, verbKind, hasQ, qWord, has) };
  }
  return out;
}

function reasonFor(
  s: Slot, k: Kind, seq: (Slot | null)[], next: Set<Slot>,
  verb: Extract<Kind, { k: "V" }> | undefined, hasQ: boolean, qWord: string | undefined, has: (s: Slot) => boolean,
): string {
  const nextList = [...next].map((n) => SLOT_NAME[n]).join(" · ");
  const nextHint = next.size ? `Next here: ${nextList}.` : "The sentence is complete — Clear to start another.";
  const first = seq.length === 0;

  switch (k.k) {
    case "ACT": {
      if (has("ACTang") || has("ACTng")) return "There's already a who. One actor per sentence.";
      if (first) return "The who comes after the verb (Kumain ako), or after hindi / a question word.";
      if (k.form === "ng" && (next.has("ACTang"))) return `The verb is actor focus, so the doer is ang-form: ${k.key === "ikaw" ? "ka" : PRONOUNS[k.key].ang}, not ${PRONOUNS[k.key].ng}.`;
      if (k.form === "ang" && (next.has("ACTng"))) return `The thing is in focus here, so the doer is ng-form: ${PRONOUNS[k.key].ng}, not ${k.key === "ikaw" ? "ka" : PRONOUNS[k.key].ang}.`;
      if (qWord === "sino") return "sino already asks who — no pronoun.";
      return nextHint;
    }
    case "V": {
      if (has("Vaf") || has("Vof")) return "There's already an action. One verb per sentence.";
      if (qWord === "ano" && k.focus === "actor") return "ano asks about the thing, so the verb flips to object focus: kakainin / kinakain / kinain.";
      if (qWord === "sino" && k.focus === "object") return "sino asks about the doer, so the verb stays actor focus: kakain / kumakain / kumain.";
      if (has("HINDI") && !has("ACTang") && !has("ACTng")) return "After hindi the actor comes first, then the verb: Hindi ako kumain.";
      if (hasQ && !has("ACTang") && !has("ACTng") && !has("MKang")) return qWord === "ano" || qWord === "sino" ? `${qWord} takes ang before the verb: ${qWord === "ano" ? "Ano ang kinain mo?" : "Sino ang kumain?"}` : `After ${qWord} the actor comes first: ${qWord} ka kumain?`;
      return nextHint;
    }
    case "HINDI":
      if (has("HINDI")) return "Already negated.";
      if (!first) return "hindi goes first: Hindi ako kumain. Clear and start with it.";
      return nextHint;
    case "BA":
      if (has("BA")) return "Already a question.";
      if (hasQ) return "A question word already makes it a question — ba isn't needed.";
      if (first) return "ba lands after the first piece: Kumain ka ba?";
      if (has("BA") === false && (has("MKng") || has("MKang") || has("N") || has("T"))) return "ba comes right after the verb and actor, before the thing: Kumain ka ba ng isda?";
      return nextHint;
    case "Q":
      if (hasQ) return "One question word per sentence.";
      if (has("BA")) return "ba already makes it a yes/no question. A question word replaces ba — Clear and start with it.";
      if (!first) return "Question words go first: Bakit ka kumain? Clear and start with it.";
      return nextHint;
    case "MK": {
      if (first) return "Markers tag a thing. They come after the verb and the who.";
      if (has("MKng") || has("MKang")) return "One marker per thing.";
      if (k.m === "ang" && next.has("MKng")) return "Actor focus: the thing takes ng (not in focus). ang would put it in focus — that needs kinain.";
      if (k.m === "ng" && next.has("MKang")) return "The thing is in focus here, so it takes ang: Kinain ko ang isda.";
      return nextHint;
    }
    case "N":
      if (has("N")) return "One thing per sentence.";
      if (!has("MKng") && !has("MKang")) return "A thing needs its marker first: ng (not in focus) or ang (in focus).";
      return nextHint;
    case "T":
      if (has("T")) return "One time per sentence.";
      if (first || !verb) return "Time goes at the end, after the action.";
      return nextHint;
    default:
      return nextHint;
  }
}
