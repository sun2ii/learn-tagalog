"use client";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { ALL_VOCAB, getVocabGroup, type VocabEntry } from "@/content/vocab";
import { getDueCardIds } from "@/lib/learner";
import { shuffle } from "@/lib/exercises";
import { Flashcards, type Card } from "@/components/Flashcards";
import { toVocabCards } from "@/lib/cards";

function Practice() {
  const set = useSearchParams().get("set") || "all";
  const title = set === "all" ? "All words" : set === "due" ? "Due words" : getVocabGroup(set)?.name ?? "Words";
  const cards = useMemo<Card[]>(() => {
    if (set === "due") { const ids = new Set(getDueCardIds()); return shuffle(ALL_VOCAB.flatMap(toVocabCards).filter((c) => ids.has(c.id))); }
    const ws: VocabEntry[] = set === "all" ? ALL_VOCAB.filter((w) => w.tier === 1) : getVocabGroup(set)?.words ?? [];
    return shuffle(ws.flatMap(toVocabCards));
  }, [set]);
  return <Flashcards title={title} cards={cards} exitHref="/library/vocabulary/" />;
}

export default function VocabPracticePage() {
  return <Suspense fallback={null}><Practice /></Suspense>;
}
