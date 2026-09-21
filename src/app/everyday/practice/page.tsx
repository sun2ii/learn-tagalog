"use client";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { EVERYDAY_PHRASES, getGroup, phraseId, type Phrase } from "@/content/everyday";
import { getDueCardIds } from "@/lib/learner";
import { shuffle } from "@/lib/exercises";
import { Flashcards, type Card } from "@/components/Flashcards";
import { toPhraseCard } from "@/lib/cards";


function Practice() {
  const set = useSearchParams().get("set") || "all";
  const title = set === "all" ? "All phrases" : set === "due" ? "Due phrases" : getGroup(set)?.name ?? "Phrases";
  const cards = useMemo<Card[]>(() => {
    let ps: Phrase[];
    if (set === "due") { const ids = new Set(getDueCardIds()); ps = EVERYDAY_PHRASES.flatMap((g) => g.phrases).filter((p) => ids.has(phraseId(p))); }
    else if (set === "all") ps = EVERYDAY_PHRASES.flatMap((g) => g.phrases);
    else ps = getGroup(set)?.phrases ?? [];
    return shuffle(ps).map(toPhraseCard);
  }, [set]);
  return <Flashcards title={title} cards={cards} exitHref="/everyday/" />;
}

export default function PracticePage() {
  return <Suspense fallback={null}><Practice /></Suspense>;
}
