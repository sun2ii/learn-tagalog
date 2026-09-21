"use client";
// Cards for the flashcard loop, from both books. Also what Session pulls when something is due.
import { EVERYDAY_PHRASES, phraseId, type Phrase } from "@/content/everyday";
import { ALL_VOCAB, vocabId, type VocabEntry } from "@/content/vocab";
import { getDueCardIds } from "@/lib/learner";
import type { Card } from "@/components/Flashcards";

export const toPhraseCard = (p: Phrase): Card => ({ id: phraseId(p), front: p.english, back: p.tagalog, sub: p.formal, note: p.note });

const ASPECT = [["not yet · 0", "will"], ["ongoing · ½", "is …ing"], ["done · 1", "did"]] as const;

/** A word → its cards. Verbs with forms become three cards (not yet · ongoing · done) so each shape gets its own rep. */
export function toVocabCards(w: VocabEntry): Card[] {
  if (w.forms) {
    return w.forms.map((form, k) => ({
      id: `${vocabId(w)}:${k}`,
      front: `${w.m} — ${ASPECT[k][0]}`,
      back: form,
      sub: `${w.t} · ${w.forms!.join(" · ")}`,
      note: w.ex ? `${w.ex} — ${w.exEn ?? ""}` : w.note,
      aspect: (["contemplated", "ongoing", "completed"] as const)[k],
    }));
  }
  return [{ id: vocabId(w), front: w.m, back: w.t, sub: w.ex, note: w.note }];
}
export const toVocabCard = (w: VocabEntry): Card => toVocabCards(w)[0];

/** Everything due right now, phrases and words together. */
export function dueCards(): Card[] {
  const ids = new Set(getDueCardIds());
  return [
    ...EVERYDAY_PHRASES.flatMap((g) => g.phrases).filter((p) => ids.has(phraseId(p))).map(toPhraseCard),
    ...ALL_VOCAB.flatMap(toVocabCards).filter((c) => ids.has(c.id)),
  ];
}
