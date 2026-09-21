// Verb Lab data layer. Two classifications, kept apart on purpose:
//   SEMANTIC   – how the learner browses roots (essential, movement, food & body …)
//   MORPHOLOGY – how a root actually behaves (family, which voices it has) — from the validated tables only.
// Nothing here generates a form. Forms come from vocab.ts / the language layer; this file only chooses and labels.

import { VERB_LIST, RULES, pieces, ASPECTS, type Verb, type Aspect, type Family, type Piece } from "./verbs";
import { PRONOUNS } from "@/languages/tagalog/pronouns";

export type Voice = "actor" | "object";
export const VOICE_LABEL: Record<Voice, { name: string; sub: string }> = {
  actor: { name: "Actor voice", sub: "actor focus" },
  object: { name: "Object voice", sub: "object / patient focus" },
};
export const ASPECT_UI: Record<Aspect, { name: string; sub: string }> = {
  contemplated: { name: "Not yet", sub: "contemplated" },
  ongoing: { name: "Happening", sub: "ongoing · imperfective" },
  completed: { name: "Done", sub: "completed · perfective" },
};

/* ---------------- Semantic categories (learner-facing) ---------------- */
export interface Category { id: string; name: string; roots: string[] }
export const CATEGORIES: Category[] = [
  { id: "essential", name: "Essential", roots: ["kain", "inom", "punta", "kuha", "bili", "bigay"] },
  { id: "movement", name: "Movement", roots: ["punta", "alis", "dating", "uwi", "lakad", "takbo", "sakay", "baba", "upo", "tayo"] },
  { id: "food-body", name: "Food & body", roots: ["kain", "inom", "luto", "tulog", "gising", "ligo"] },
  { id: "communication", name: "Communication", roots: ["sabi", "salita", "tanong", "sagot", "kinig", "intindi"] },
  { id: "daily", name: "Daily actions", roots: ["bili", "kuha", "bigay", "bayad", "gawa", "tulong", "hintay", "trabaho", "sulat", "basa"] },
  { id: "perception", name: "Learning & perception", roots: ["aral", "intindi", "tingin", "kita", "kinig", "basa"] },
  { id: "social", name: "Social & play", roots: ["laro", "kanta", "tawa", "tulong"] },
];
export function categoryOf(root: string): Category | undefined {
  return CATEGORIES.find((c) => c.id !== "essential" && c.roots.includes(root)) ?? CATEGORIES.find((c) => c.roots.includes(root));
}

/* ---------------- The lab's view of a root: validated voices only ---------------- */
export interface LabRoot {
  root: string;
  english: string;
  family: Family;
  voices: Partial<Record<Voice, Verb>>;   // only the voices the tables actually have
  object?: { key: string; tl: string; en: string; enThe: string };  // one curated, semantically safe object
  intransitive?: boolean;                  // no object at all (punta, tulog…)
  place?: { tl: string; en: string; phrase: string; marker?: string };  // sa-phrase: "sa palengke" · "the market" · " to the market"
}

/* One safe object (or place) per root. Curated, not combinatorial. */
const OBJECTS: Record<string, { tl: string; en: string; enThe: string }> = {
  kain: { tl: "mangga", en: "mango", enThe: "the mango" }, inom: { tl: "tubig", en: "water", enThe: "the water" },
  kuha: { tl: "susi", en: "the keys", enThe: "the keys" }, bili: { tl: "tinapay", en: "bread", enThe: "the bread" },
  bigay: { tl: "regalo", en: "a gift", enThe: "the gift" }, luto: { tl: "adobo", en: "adobo", enThe: "the adobo" },
  sabi: { tl: "totoo", en: "the truth", enThe: "the truth" }, sulat: { tl: "sulat", en: "a letter", enThe: "the letter" },
  basa: { tl: "libro", en: "a book", enThe: "the book" }, gawa: { tl: "kape", en: "coffee", enThe: "the coffee" },
  kanta: { tl: "kanta", en: "a song", enThe: "the song" }, hintay: { tl: "jeep", en: "for the jeep", enThe: "for the jeep" },
  bayad: { tl: "bill", en: "the bill", enThe: "the bill" }, kita: { tl: "bituin", en: "the stars", enThe: "the stars" },
  aral: { tl: "Tagalog", en: "Tagalog", enThe: "Tagalog" }, laro: { tl: "basketball", en: "basketball", enThe: "basketball" },
  intindi: { tl: "salita", en: "the word", enThe: "the word" },
  // object-voice only (the actor-voice sentence stays intransitive or uses sa): see NO_OBJECT / PLACES
  gising: { tl: "bata", en: "the child", enThe: "the child" }, sagot: { tl: "tanong", en: "the question", enThe: "the question" },
  tanong: { tl: "driver", en: "the driver", enThe: "the driver" },
};
const PLACES: Record<string, { tl: string; en: string; phrase: string; marker?: string }> = {
  punta: { tl: "palengke", en: "the market", phrase: " to the market" }, alis: { tl: "bahay", en: "the house", phrase: " the house" },
  dating: { tl: "Maynila", en: "Manila", phrase: " in Manila" }, lakad: { tl: "parke", en: "the park", phrase: " in the park" },
  sakay: { tl: "jeep", en: "the jeep", phrase: " the jeep" }, baba: { tl: "kanto", en: "the corner", phrase: " at the corner" },
  tingin: { tl: "langit", en: "the sky", phrase: " at the sky" }, kinig: { tl: "musika", en: "the music", phrase: " to the music" },
  upo: { tl: "silya", en: "the chair", phrase: " on the chair" }, trabaho: { tl: "opisina", en: "the office", phrase: " at the office" },
  ligo: { tl: "dagat", en: "the sea", phrase: " in the sea" },
  tulong: { tl: "bata", en: "the child", phrase: " the child", marker: "marks the person who receives the help" },
  tanong: { tl: "driver", en: "the driver", phrase: " the driver", marker: "marks the person being asked" },
};
const NO_OBJECT = new Set(["uwi", "takbo", "tayo", "tulog", "gising", "tawa", "salita", "sagot"]);

export const LAB_ROOTS: LabRoot[] = (() => {
  const map = new Map<string, LabRoot>();
  const OBJECT_ONLY = new Set(["kita", "intindi"]);  // ma- perception verbs: nakita KO ang X — the thing is the center
  for (const v of VERB_LIST) {
    const e = map.get(v.root) ?? { root: v.root, english: v.meaning, family: v.family, voices: {} };
    if (v.focus === "object" || OBJECT_ONLY.has(v.root)) { e.voices.object = v; if (!e.voices.actor) { e.family = v.family; e.english = v.meaning.replace(" (object focus)", ""); } }
    else { e.voices.actor = v; e.family = v.family; e.english = v.meaning; }
    map.set(v.root, e);
  }
  return [...map.values()].filter((r) => r.voices.actor || r.voices.object).map((r) => {
    if (OBJECTS[r.root]) r.object = { key: r.root, ...OBJECTS[r.root] };   // used by object voice; by actor voice only if not intransitive and no sa-phrase
    if (PLACES[r.root]) r.place = PLACES[r.root];                             // actor voice: sa-phrase
    if (NO_OBJECT.has(r.root)) { r.intransitive = true; delete r.place; }     // actor voice takes nothing (object kept for object voice)
    if (!r.object && !r.place) r.intransitive = true;
    return r;
  });
})();
export const getLabRoot = (root: string) => LAB_ROOTS.find((r) => r.root === root);

/* ---------------- English verb forms ---------------- */
const IRREGULAR: Record<string, [string, string]> = { // base → [past, -ing]
  eat: ["ate", "eating"], drink: ["drank", "drinking"], go: ["went", "going"], "go home": ["went home", "going home"], leave: ["left", "leaving"],
  arrive: ["arrived", "arriving"], walk: ["walked", "walking"], run: ["ran", "running"], "ride / board": ["rode", "riding"], "get off / go down": ["got off", "getting off"],
  sit: ["sat", "sitting"], stand: ["stood", "standing"], "get / take": ["got", "getting"], say: ["told", "telling"], buy: ["bought", "buying"], give: ["gave", "giving"],
  sleep: ["slept", "sleeping"], "wake up": ["woke up", "waking up"], "bathe / shower": ["bathed", "bathing"], look: ["looked", "looking"], see: ["saw", "seeing"],
  listen: ["listened", "listening"], "speak / talk": ["spoke", "speaking"], ask: ["asked", "asking"], answer: ["answered", "answering"],
  understand: ["understood", "understanding"], help: ["helped", "helping"], wait: ["waited", "waiting"], pay: ["paid", "paying"], cook: ["cooked", "cooking"],
  work: ["worked", "working"], study: ["studied", "studying"], play: ["played", "playing"], sing: ["sang", "singing"], laugh: ["laughed", "laughing"],
  "make / do": ["made", "making"], write: ["wrote", "writing"], read: ["read", "reading"],
};
function enForms(meaning: string): { base: string; past: string; ing: string } {
  const base = meaning.split(" (")[0];
  const irr = IRREGULAR[base];
  if (irr) return { base: base.split(" / ")[0], past: irr[0], ing: irr[1] };
  const b = base.split(" / ")[0];
  return { base: b, past: b.endsWith("e") ? b + "d" : b + "ed", ing: b.endsWith("e") ? b.slice(0, -1) + "ing" : b + "ing" };
}

/** "eat → ate" — the English shape of a root at an aspect, for the example pair. */
export function verbEnglish(r: LabRoot, aspect: Aspect): { base: string; form: string } {
  const en = enForms(r.english);
  return { base: en.base, form: aspect === "completed" ? en.past : aspect === "ongoing" ? en.ing : `will ${en.base}` };
}

/* ---------------- Sentences ---------------- */
export interface SentencePiece { text: string; role: "verb" | "actor" | "marker" | "object" | "place"; explain: string }
export interface LabSentence { tl: string; en: string; pieces: SentencePiece[] }

const EN_SUBJ: Record<string, string> = { ako: "I", ikaw: "you", siya: "he / she", kami: "we", tayo: "we", kayo: "you all", sila: "they" };
const be = (p: string) => (p === "ako" ? "am" : ["ikaw", "kami", "tayo", "kayo", "sila"].includes(p) ? "are" : "is");
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** The example sentence for a root · aspect · voice · pronoun. Only builds what the tables validate. */
export function labSentence(r: LabRoot, aspect: Aspect, voice: Voice, pronoun = "ako", withObject = true): LabSentence | null {
  const v = r.voices[voice];
  if (!v) return null;
  const form = v.forms[ASPECTS.indexOf(aspect)];
  const en = enForms(r.english);
  const subj = EN_SUBJ[pronoun] ?? "I";
  const pieces: SentencePiece[] = [];
  const P = PRONOUNS[pronoun];
  const aspectName = ASPECT_UI[aspect].name.toLowerCase();

  if (voice === "actor") {
    const actorForm = pronoun === "ikaw" ? "ka" : P.ang;
    pieces.push({ text: cap(form), role: "verb", explain: `${aspectName} · actor-voice form of ${r.root}` });
    pieces.push({ text: actorForm, role: "actor", explain: `the actor, "${subj}" — this form (${actorForm}) is used when the actor is what the sentence centers on` });
    let tlObj = "", enObj = "";
    if (withObject && r.place) {
      pieces.push({ text: "sa", role: "marker", explain: r.place.marker ?? `marks ${r.place.tl} as a place or direction, not the center of the sentence` });
      pieces.push({ text: r.place.tl, role: "place", explain: r.place.en });
      tlObj = ` sa ${r.place.tl}`; enObj = r.place.phrase;
    } else if (withObject && r.object && !r.intransitive) {
      pieces.push({ text: "ng", role: "marker", explain: `marks ${r.object.tl} as the thing acted on, not the center of the sentence` });
      pieces.push({ text: r.object.tl, role: "object", explain: r.object.en });
      tlObj = ` ng ${r.object.tl}`; enObj = ` ${r.object.en}`;
    }
    const verbEn = aspect === "completed" ? en.past : aspect === "ongoing" ? `${be(pronoun)} ${en.ing}` : `will ${en.base}`;
    return { tl: `${cap(form)} ${actorForm}${tlObj}.`, en: `${cap(subj)} ${verbEn}${enObj}.`, pieces };
  }
  // object voice: form + ng-pronoun + ang + object
  if (!r.object) return null;
  pieces.push({ text: cap(form), role: "verb", explain: `${aspectName} · object-voice form of ${r.root}` });
  pieces.push({ text: P.ng, role: "actor", explain: `still the actor, "${subj}" — but now the sentence centers on the object, so the actor takes this form (${P.ng})` });
  pieces.push({ text: "ang", role: "marker", explain: `marks ${r.object.tl} as the center of the sentence — the thing this sentence is about` });
  pieces.push({ text: r.object.tl, role: "object", explain: r.object.enThe });
  const verbEn = aspect === "completed" ? en.past : aspect === "ongoing" ? `${be(pronoun)} ${en.ing}` : `will ${en.base}`;
  return { tl: `${cap(form)} ${P.ng} ang ${r.object.tl}.`, en: `${cap(subj)} ${verbEn} ${r.object.enThe}.`, pieces };
}

/* ---------------- Morphology steps for the visualizer ---------------- */
export interface Step { label: string; pieces: Piece[] }
/** root → (reduplicate) → (affix) → form. Only steps that actually happen. If the real word has a sound change, the last step shows it. */
export function steps(r: LabRoot, aspect: Aspect, voice: Voice): { steps: Step[]; real: string; soundChange: boolean } {
  const v = r.voices[voice]!;
  const rule = RULES[v.family][aspect];
  const real = v.forms[ASPECTS.indexOf(aspect)];
  const out: Step[] = [{ label: "root", pieces: [{ text: r.root, kind: "root" }] }];
  if (rule.double) out.push({ label: "repeat the first syllable", pieces: pieces(r.root, true, "none") });
  if (rule.affix !== "none") out.push({ label: affixLabel(rule.affix), pieces: pieces(r.root, rule.double, rule.affix) });
  const built = out[out.length - 1].pieces.map((p) => p.text).join("");
  const soundChange = built.toLowerCase() !== real.toLowerCase();
  return { steps: out, real, soundChange };
}
function affixLabel(a: string) {
  return ({ um: "add -um- after the first consonant", "in-inside": "add -in- after the first consonant", "in-ending": "add -in at the end", mag: "add mag- in front", nag: "add nag- in front", ma: "add ma- in front", na: "add na- in front" } as Record<string, string>)[a] ?? a;
}

/** Roots that share this root's family and have the same voice — the only fair "try the pattern" targets. */
export function transferTargets(r: LabRoot, voice: Voice, n = 3): LabRoot[] {
  return LAB_ROOTS.filter((o) => o.root !== r.root && o.voices[voice] && o.voices[voice]!.family === r.voices[voice]!.family).slice(0, n);
}

/* ---------------- Morphological patterns: the map ----------------
   Rows = the root's actor-voice family (-um- / mag- / ma-: a property of the root you memorize).
   Columns = voice. Object voice is the same -in- rule for every family, so a root sits in its family row
   in both columns when the tables have both forms. Nothing here generates a form. */
export type FamilyRow = "um" | "mag" | "ma";
export interface Pattern {
  id: string;            // "um-actor" | "um-object" | …
  row: FamilyRow;        // the root's actor family — the row of the map
  family: Family;        // the family of the forms in this cell (row for actor, "in" for object)
  voice: Voice;
  label: string;         // "-UM-"
  sub: string;           // "Actor voice · -um- after the first consonant"
  roots: LabRoot[];
}
export const ROW_LABEL: Record<FamilyRow, string> = { um: "-UM-", mag: "MAG-", ma: "MA-" };
const ROW_RULE: Record<FamilyRow, string> = {
  um: "-um- slips in after the first consonant",
  mag: "mag- in front, becomes nag- once it starts",
  ma: "ma- in front, becomes na- once it starts",
};
const OBJECT_RULE = "-in at the end, -in- inside once it starts";
export const PATTERNS: Pattern[] = (["um", "mag", "ma"] as FamilyRow[]).flatMap((row) =>
  (["actor", "object"] as Voice[]).map((voice) => ({
    id: `${row}-${voice}`, row, voice,
    family: (voice === "actor" ? row : "in") as Family,
    label: ROW_LABEL[row],
    sub: `${VOICE_LABEL[voice].name} · ${voice === "actor" ? ROW_RULE[row] : OBJECT_RULE}`,
    roots: LAB_ROOTS.filter((r) => r.voices.actor?.family === row && (voice === "actor" || r.voices.object?.family === "in")),
  })),
).filter((p) => p.roots.length > 0);
export const ROWS: FamilyRow[] = ["um", "mag", "ma"];
export const patternAt = (row: FamilyRow, voice: Voice) => PATTERNS.find((p) => p.row === row && p.voice === voice);
export const getPattern = (id: string | null | undefined) => (id ? PATTERNS.find((p) => p.id === id) : undefined);
/** The pattern a root is currently showing (family × voice). */
export function patternOf(r: LabRoot, voice: Voice): Pattern | undefined {
  return PATTERNS.find((p) => p.voice === voice && p.roots.includes(r));
}
/** The form a root takes in this pattern at this aspect — read from the tables, never generated. */
export function patternForm(p: Pattern, r: LabRoot, aspect: Aspect = "completed"): string {
  return r.voices[p.voice]!.forms[ASPECTS.indexOf(aspect)];
}
/** Other roots in the pattern, least-recently-seen first, so "try another" keeps moving. */
export function patternTargets(p: Pattern, exclude: string, seen: string[] = [], n = Infinity): LabRoot[] {
  const rest = p.roots.filter((r) => r.root !== exclude);
  const fresh = rest.filter((r) => !seen.includes(r.root));
  const old = rest.filter((r) => seen.includes(r.root));
  return [...fresh, ...old].slice(0, n);
}
