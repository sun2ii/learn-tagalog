// Free-build analyzer: takes the pieces you tapped, works out what sentence
// you were reaching for, renders the natural order with the language renderer,
// and explains the difference. It never invents grammar – the renderer is the
// authority; this file only maps pieces → state and diagnoses.

import type { SentenceState, QuestionWord } from "@/engine/types";
import { render, type RenderedSentence, type SentencePart } from "@/languages/tagalog/renderer";
import { VERBS } from "@/languages/tagalog/verbs";
import { PRONOUNS } from "@/languages/tagalog/pronouns";
import { NOUNS } from "@/languages/tagalog/nouns";
import { TIME_EXPRESSIONS, isTimeCompatible } from "@/languages/tagalog/time";

export interface Analysis {
  status: "empty" | "incomplete" | "ok" | "fix";
  headline: string;
  notes: string[];
  yours: SentencePart[];
  yoursState?: SentenceState;
  fixed?: RenderedSentence;
  fixedState?: SentenceState;
}

const WH: QuestionWord[] = ["ano", "sino", "saan", "kailan", "bakit", "paano"];
const norm = (t: string) => t.toLowerCase().replace(/[.,!?]/g, "");

type Found = {
  verb?: { aspect: string; focus: "actor" | "object"; text: string; root: string };
  pronoun?: { key: string; form: "ang" | "ng"; text: string };
  marker?: "ng" | "ang";
  noun?: string;
  time?: string;
  hindi?: boolean;
  ba?: boolean;
  wh?: QuestionWord;
  unknown: string[];
};

const OBJECT_CATEGORY: Record<string, string> = { kain: "food", inom: "drink", kuha: "item", bili: "item", gawa: "item", sulat: "document", basa: "document" };
/** A noun that fits the verb (kain → mangga, inom → tubig …) for the "added one so you can see the shape" case. */
export function defaultObject(root: string): string {
  const cat = OBJECT_CATEGORY[root];
  return Object.keys(NOUNS).find((k) => NOUNS[k].category === cat) ?? "mangga";
}
/** The nouns that make sense with this verb, in table order. */
export function nounsFor(root: string): string[] {
  const cat = OBJECT_CATEGORY[root];
  return Object.keys(NOUNS).filter((k) => NOUNS[k].category === cat);
}

function classify(tokens: string[]): Found {
  const f: Found = { unknown: [] };
  for (const raw of tokens) {
    const t = norm(raw);
    let hit = false;
    for (const v of Object.values(VERBS)) {
      for (const [aspect, form] of Object.entries(v.actorFocus)) if (form === t) { f.verb = { aspect, focus: "actor", text: t, root: v.root }; hit = true; }
      if (v.objectFocus) for (const [aspect, form] of Object.entries(v.objectFocus)) if (form === t) { f.verb = { aspect, focus: "object", text: t, root: v.root }; hit = true; }
    }
    if (hit) continue;
    for (const [key, p] of Object.entries(PRONOUNS)) {
      if (t === p.ang || (key === "ikaw" && t === "ka")) { f.pronoun = { key, form: "ang", text: t }; hit = true; break; }
      if (t === p.ng) { f.pronoun = { key, form: "ng", text: t }; hit = true; break; }
    }
    if (hit) continue;
    if (t === "ng" || t === "ang") { f.marker = t; continue; }
    if (NOUNS[t]) { f.noun = t; continue; }
    if (TIME_EXPRESSIONS[t]) { f.time = t; continue; }
    if (t === "hindi") { f.hindi = true; continue; }
    if (t === "ba") { f.ba = true; continue; }
    if (WH.includes(t as QuestionWord)) { f.wh = t as QuestionWord; continue; }
    f.unknown.push(t);
  }
  return f;
}

export function analyze(pieces: { text: string; role: SentencePart["dimension"] }[]): Analysis {
  const yours: SentencePart[] = pieces.map((p) => ({ text: p.text, dimension: p.role }));
  if (pieces.length === 0) return { status: "empty", headline: "", notes: [], yours };

  const f = classify(pieces.map((p) => p.text));
  const notes: string[] = [];

  // Repeats: every piece has one job, so it appears once.
  const counts = new Map<string, number>();
  pieces.forEach((p) => { const t = norm(p.text); counts.set(t, (counts.get(t) ?? 0) + 1); });
  const dupes = [...counts.entries()].filter(([, n]) => n > 1).map(([t, n]) => `${t} ×${n}`);
  if (dupes.length) {
    const only = new Set<string>(); const kept = pieces.filter((p) => { const t = norm(p.text); if (only.has(t)) return false; only.add(t); return true; });
    const inner = analyze(kept);
    const note = `Each piece appears once — it has one job. Dropped the repeats (${dupes.join(", ")}).`;
    return { ...inner, status: inner.status === "ok" ? "fix" : inner.status, headline: inner.status === "ok" ? "Rearranged." : inner.headline, notes: [note, ...inner.notes], yours };
  }

  if (!f.verb) {
    const hint = f.wh === "sino" ? "Sino ang kumain? — sino, then ang, then the actor-focus verb."
      : f.wh === "ano" ? "Ano ang kinain mo? — ano, then ang, then the object-focus verb and the doer in ng-form."
      : f.wh ? `${f.wh.charAt(0).toUpperCase() + f.wh.slice(1)} ka kumain? — question word, actor, verb.`
      : f.hindi ? "Hindi ako kumain. — hindi, actor, verb."
      : "Every sentence here is built around a verb form: kakain · kumakain · kumain (or kakainin · kinakain · kinain).";
    return { status: "incomplete", headline: "Needs an action.", notes: [hint], yours };
  }
  if (!f.pronoun && f.wh !== "sino") {
    const objFocus = f.verb.focus === "object" || f.wh === "ano";
    return { status: "incomplete", headline: "Needs a who.", notes: [objFocus
      ? `${f.wh === "ano" ? "ano" : f.verb.text} puts the thing in focus, so the doer takes the ng-form: ko · mo · niya · namin · natin · ninyo · nila.`
      : "Add an actor: ako · ka · siya · kami · tayo · kayo · sila."], yours };
  }

  // Work out the intended sentence.
  let focus: "actor" | "object" = f.verb.focus;
  if (f.wh === "ano") focus = "object";
  const state: SentenceState = { root: f.verb.root, aspect: f.verb.aspect, actor: f.pronoun?.key ?? "ako", focus };
  if (f.noun) state.object = f.noun;
  if (f.time) state.time = f.time;
  if (f.hindi) state.polarity = "negative";
  if (f.wh) { state.mood = "wh_question"; state.questionWord = f.wh; }
  else if (f.ba) state.mood = "yes_no";

  // Object focus needs an object; ano needs one too.
  if ((focus === "object" || f.wh === "ano") && !state.object) {
    state.object = f.noun ?? defaultObject(f.verb.root);
    if (!f.noun) notes.push(f.wh === "ano" ? `ano asks about a thing, so the verb flips to object focus (${f.verb.text}) and the doer takes the ng-form (ko/mo).` : `${f.verb.text} is object focus: something has to be the object. Added one so you can see the shape.`);
  }
  if (f.wh === "sino") { state.actor = f.pronoun?.key ?? "ako"; }

  // Time/aspect compatibility.
  if (state.time && !isTimeCompatible(state.time, state.aspect)) {
    const t = state.time;
    notes.push(`${t} doesn't go with ${f.verb.text}: ${t} = ${TIME_EXPRESSIONS[t].english}, which needs a ${TIME_EXPRESSIONS[t].compatibleAspects.join(" / ")} verb.`);
    delete state.time;
  }

  // "Kumain ako." is a fine sentence even though the drill generator always adds an object,
  // so render directly and only bail if the renderer itself can't build it.
  let fixed: RenderedSentence;
  try { fixed = render(state); } catch {
    return { status: "incomplete", headline: "Can't make that one yet.", notes: notes.length ? notes : ["Try a simpler combination."], yours, yoursState: state };
  }
  const a = yours.map((p) => norm(p.text));
  const b = fixed.parts.map((p) => norm(p.text));
  const same = a.length === b.length && a.every((t, i) => t === b[i]);
  if (same && notes.length === 0) return { status: "ok", headline: "Natural.", notes: [fixed.english], yours, yoursState: state, fixed, fixedState: state };

  // Diagnose the differences, most-specific first.
  const wantActor = fixed.parts.find((p) => p.dimension === "actor")?.text.toLowerCase();
  if (f.pronoun && wantActor && f.pronoun.text !== wantActor) {
    notes.push(focus === "object"
      ? `With ${fixed.parts.find((p) => p.dimension === "verb")?.text.toLowerCase()} the thing is in focus, so the doer takes the ng-form: ${f.pronoun.text} → ${wantActor}.`
      : `${f.verb.text} is actor focus, so the doer takes the ang-form: ${f.pronoun.text} → ${wantActor}.`);
  }
  const wantMarker = fixed.parts.find((p) => p.dimension === "particle")?.text.toLowerCase();
  if (wantMarker && f.marker !== wantMarker) {
    notes.push(f.marker
      ? `The object takes ${wantMarker} here, not ${f.marker}: ${wantMarker === "ng" ? "ng = a thing that isn't in focus" : "ang = the thing in focus"}.`
      : `A noun needs its marker: ${wantMarker} ${state.object}.`);
  }
  if (f.hindi && a[0] !== "hindi") notes.push("hindi goes first, and the actor slides in right after it: Hindi ako kumain.");
  else if (f.hindi && a[1] !== b[1]) notes.push("After hindi, the actor comes before the verb: Hindi ako kumain, not Hindi kumain ako.");
  if (f.ba && a[1] !== "ba" && !f.hindi && !f.wh) notes.push("ba lands after the first piece: Kumain ka ba?");
  if (f.ba && f.hindi && a[2] !== "ba") notes.push("With hindi, ba comes after the actor: Hindi ka ba kumain?");
  if (f.wh && a[0] !== f.wh) notes.push(`Question words go first: ${f.wh.charAt(0).toUpperCase() + f.wh.slice(1)} …`);
  if (f.wh && f.ba) notes.push("A question word already makes it a question – drop ba.");
  if (f.wh && ["bakit", "kailan", "saan", "paano"].includes(f.wh) && a.indexOf(norm(wantActor ?? "")) > a.indexOf(f.verb.text)) notes.push(`After ${f.wh}, the actor comes before the verb: ${f.wh.charAt(0).toUpperCase() + f.wh.slice(1)} ka kumain?`);
  if (f.wh === "sino" && f.pronoun) notes.push("sino asks who did it, so there's no pronoun: Sino ang kumain?");
  if (f.time && a.indexOf(f.time) !== a.length - 1) notes.push("Time goes at the end.");
  if (notes.length === 0) {
    const vi = a.indexOf(f.verb.text), pi = wantActor ? a.indexOf(norm(wantActor)) : -1;
    if (!f.hindi && !f.wh && pi >= 0 && pi < vi) notes.push("Statements lead with the verb: Kumain ako, not Ako kumain.");
    else notes.push("Same pieces, natural order.");
  }
  if (f.unknown.length) notes.push(`Not sure what to do with: ${f.unknown.join(", ")}.`);

  return { status: "fix", headline: "Rearranged.", notes, yours, yoursState: state, fixed, fixedState: state };
}

/* What each piece is – for hover. */
export const PIECE_INFO: Record<string, { meaning: string; note: string }> = {
  hindi: { meaning: "not / no", note: "Goes first. The actor slides in right after it: Hindi ako kumain." },
  ba: { meaning: "yes / no marker", note: "Turns a statement into a question. Sits after the first piece: Kumain ka ba?" },
  ano: { meaning: "what", note: "Asks about a thing → object focus verb + ang: Ano ang kinain mo?" },
  sino: { meaning: "who", note: "Asks about the doer → ang + actor focus verb: Sino ang kumain?" },
  saan: { meaning: "where (it happens)", note: "Saan ka kumain? — 'nasaan' is for where something IS." },
  kailan: { meaning: "when", note: "Kailan ka kumain? Replaces the time word." },
  bakit: { meaning: "why", note: "Bakit ka kumain? Question word first, then actor, then verb." },
  paano: { meaning: "how", note: "Paano ka kumain?" },
  kumain: { meaning: "ate (actor focus)", note: "k-um-ain: -um- slips in after the first consonant. Completed." },
  kumakain: { meaning: "is eating (actor focus)", note: "ku-MA-kain: the doubled syllable means 'not finished'. Ongoing." },
  kakain: { meaning: "will eat (actor focus)", note: "KA-kain: doubled syllable, no -um-: hasn't started." },
  kinain: { meaning: "ate (object focus)", note: "k-in-ain: -in- puts the THING in the spotlight. The eater becomes ko/mo/niya." },
  kinakain: { meaning: "is eating (object focus)", note: "ki-NA-kain: ongoing, thing in focus." },
  kakainin: { meaning: "will eat (object focus)", note: "ka-kain-IN: future, thing in focus." },
  ako: { meaning: "I", note: "ang-form. Use after actor-focus verbs: Kumain ako." },
  ka: { meaning: "you", note: "ang-form, short. 'ikaw' at the start of a sentence, 'ka' after a word." },
  siya: { meaning: "he / she", note: "ang-form. No gender in Tagalog." },
  kami: { meaning: "we (not you)", note: "ang-form, exclusive: the listener is not included." },
  tayo: { meaning: "we (with you)", note: "ang-form, inclusive: the listener is in. Kain tayo!" },
  kayo: { meaning: "you all / you (polite)", note: "ang-form. Also polite singular for elders." },
  sila: { meaning: "they", note: "ang-form." },
  ko: { meaning: "I / my (ng-form)", note: "Doer when something else is in focus: Kinain ko ang mangga. Also after gusto." },
  mo: { meaning: "you / your (ng-form)", note: "Kinain mo ang mangga. Ano ang kinain mo?" },
  niya: { meaning: "he / she (ng-form)", note: "Kinain niya ang mangga." },
  namin: { meaning: "we (not you, ng-form)", note: "Kinain namin ang mangga." },
  natin: { meaning: "we (with you, ng-form)", note: "Kinain natin ang mangga." },
  ninyo: { meaning: "you all (ng-form)", note: "Kinain ninyo ang mangga." },
  nila: { meaning: "they (ng-form)", note: "Kinain nila ang mangga." },
  ng: { meaning: "marker: not in focus", note: "Marks the thing when the doer is in focus: Kumain ako NG mangga. Said 'nang'." },
  ang: { meaning: "marker: in focus", note: "Marks the spotlight noun: Kinain ko ANG mangga. Ano ANG kinain mo?" },
  mangga: { meaning: "mango", note: "" }, kanin: { meaning: "cooked rice", note: "Uncooked rice is 'bigas'." }, isda: { meaning: "fish", note: "" },
  manok: { meaning: "chicken", note: "" }, tinapay: { meaning: "bread", note: "" }, mansanas: { meaning: "apple", note: "From Spanish 'manzanas'." }, adobo: { meaning: "adobo", note: "" },
  kahapon: { meaning: "yesterday", note: "Needs a completed verb: kumain." },
  ngayon: { meaning: "now / today", note: "Goes with ongoing (kumakain) or completed (kumain = ate today)." },
  mamaya: { meaning: "later (today)", note: "Needs a future verb: kakain." },
  bukas: { meaning: "tomorrow", note: "Needs a future verb: kakain." },
};

/* Hover info for every verb form and noun the builder can offer. Hand-written entries above take precedence. */
for (const v of Object.values(VERBS)) {
  const add = (form: string, focus: "actor" | "object", aspect: string) => {
    if (PIECE_INFO[form]) return;
    const en = aspect === "completed" ? v.meaningPast : aspect === "ongoing" ? `is ${v.meaningOngoing}` : `will ${v.meaning}`;
    const how = aspect === "completed" ? "completed" : aspect === "ongoing" ? "doubled syllable = not finished · ongoing" : "doubled syllable, no affix change yet · not started";
    PIECE_INFO[form] = { meaning: `${en} (${focus} focus)`, note: focus === "actor" ? `${v.root} → ${form}: ${how}.` : `${v.root} → ${form}: the THING is in the spotlight, the doer becomes ko/mo/niya. ${how}.` };
  };
  for (const [a, f] of Object.entries(v.actorFocus)) add(f, "actor", a);
  if (v.objectFocus) for (const [a, f] of Object.entries(v.objectFocus)) add(f, "object", a);
}
for (const [k, n] of Object.entries(NOUNS)) if (!PIECE_INFO[k]) PIECE_INFO[k] = { meaning: n.english, note: "" };
