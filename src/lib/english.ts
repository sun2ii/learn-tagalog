// English gloss for any verb root (the renderer's English is kain-only).
// Uses the verb table's own meanings: meaning (base), meaningPast, meaningOngoing.
import type { SentenceState } from "@/engine/types";
import { VERBS } from "@/languages/tagalog/verbs";
import { PRONOUNS, getEnglishSubject } from "@/languages/tagalog/pronouns";
import { getNounEnglish } from "@/languages/tagalog/nouns";
import { getTimeEnglish } from "@/languages/tagalog/time";

const WH: Record<string, string> = { ano: "What", sino: "Who", saan: "Where", kailan: "When", bakit: "Why", paano: "How" };

export function englishFor(s: SentenceState): string {
  const v = VERBS[s.root];
  if (!v) return "";
  let subj = getEnglishSubject(s.actor);
  if (s.actor === "kami") subj = "we (not you)"; else if (s.actor === "tayo") subj = "we (including you)";
  const plural = PRONOUNS[s.actor]?.plural || s.actor === "ikaw" || s.actor === "kayo";
  const be = s.actor === "ako" ? "am" : plural ? "are" : "is";
  const objRaw = s.object ? getNounEnglish(s.object) : "";
  const obj = s.object ? ` ${s.focus === "object" ? "the " + objRaw.replace(/^(a|an|some|the) /, "") : objRaw}` : "";
  const time = s.time && s.questionWord !== "kailan" ? ` ${getTimeEnglish(s.time)}` : "";
  const neg = s.polarity === "negative";
  const cap = (x: string) => x.charAt(0).toUpperCase() + x.slice(1);

  const q = s.mood === "wh_question" && s.questionWord ? WH[s.questionWord] : null;
  if (q) {
    if (s.questionWord === "sino") {
      const vp = s.aspect === "completed" ? v.meaningPast : s.aspect === "ongoing" ? `is ${v.meaningOngoing}` : `will ${v.meaning}`;
      return `${q} ${vp}${obj}${time}?`;
    }
    const o = s.questionWord === "ano" ? "" : obj;
    if (s.aspect === "completed") return `${q} did ${subj} ${v.meaning}${o}${time}?`;
    if (s.aspect === "ongoing") return `${q} ${be} ${subj} ${v.meaningOngoing}${o}${time}?`;
    return `${q} will ${subj} ${v.meaning}${o}${time}?`;
  }
  if (s.mood === "yes_no") {
    const n = neg ? "not " : "";
    if (s.aspect === "completed") return cap(`did ${subj} ${n}${v.meaning}${obj}${time}?`);
    if (s.aspect === "ongoing") return cap(`${be} ${subj} ${n}${v.meaningOngoing}${obj}${time}?`);
    return cap(`will ${subj} ${n}${v.meaning}${obj}${time}?`);
  }
  let vp: string;
  if (s.aspect === "completed") vp = neg ? `did not ${v.meaning}` : v.meaningPast;
  else if (s.aspect === "ongoing") vp = `${be} ${neg ? "not " : ""}${v.meaningOngoing}`;
  else vp = `will ${neg ? "not " : ""}${v.meaning}`;
  return cap(`${subj} ${vp}${obj}${time}.`);
}
