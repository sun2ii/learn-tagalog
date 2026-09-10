"use client";

import { useState, useEffect, useCallback } from "react";
import { render, isValidState } from "@/languages/tagalog/renderer";
import { getVerbForm } from "@/languages/tagalog/verbs";
import { getActorForm, getAgentForm, PRONOUNS } from "@/languages/tagalog/pronouns";
import { getNounTagalog, NOUNS } from "@/languages/tagalog/nouns";
import { getTimeTagalog, TIME_EXPRESSIONS } from "@/languages/tagalog/time";
import { getLearnerState } from "@/lib/learner";
import { getUnlockedConcepts } from "@/curriculum/unlock";
import { getVocabularyUpTo } from "@/curriculum";
import type { SentenceState, Focus } from "@/engine/types";
import type { LearnerState } from "@/curriculum/types";

type BuilderPiece = {
  id: string;
  text: string;
  type: "verb" | "pronoun" | "noun" | "time" | "particle" | "negation" | "question";
  value?: string;
};

// All available pieces based on curriculum
function getAvailablePieces(unlockedConcepts: string[]): BuilderPiece[] {
  const pieces: BuilderPiece[] = [];

  // Always have verbs (kain for now)
  if (unlockedConcepts.includes("aspect")) {
    pieces.push(
      { id: "v-completed", text: "kumain", type: "verb", value: "completed" },
      { id: "v-ongoing", text: "kumakain", type: "verb", value: "ongoing" },
      { id: "v-contemplated", text: "kakain", type: "verb", value: "contemplated" },
    );
  }

  // Object-focus verbs
  if (unlockedConcepts.includes("focus")) {
    pieces.push(
      { id: "vo-completed", text: "kinain", type: "verb", value: "completed-obj" },
      { id: "vo-ongoing", text: "kinakain", type: "verb", value: "ongoing-obj" },
      { id: "vo-contemplated", text: "kakainin", type: "verb", value: "contemplated-obj" },
    );
  }

  // Pronouns
  if (unlockedConcepts.includes("actor")) {
    pieces.push(
      { id: "p-ako", text: "ako", type: "pronoun", value: "ako" },
      { id: "p-ka", text: "ka", type: "pronoun", value: "ikaw" },
      { id: "p-siya", text: "siya", type: "pronoun", value: "siya" },
      { id: "p-kami", text: "kami", type: "pronoun", value: "kami" },
      { id: "p-tayo", text: "tayo", type: "pronoun", value: "tayo" },
      { id: "p-kayo", text: "kayo", type: "pronoun", value: "kayo" },
      { id: "p-sila", text: "sila", type: "pronoun", value: "sila" },
    );

    // Ng-form pronouns for object focus
    if (unlockedConcepts.includes("focus")) {
      pieces.push(
        { id: "pn-ko", text: "ko", type: "pronoun", value: "ako-ng" },
        { id: "pn-mo", text: "mo", type: "pronoun", value: "ikaw-ng" },
        { id: "pn-niya", text: "niya", type: "pronoun", value: "siya-ng" },
        { id: "pn-namin", text: "namin", type: "pronoun", value: "kami-ng" },
        { id: "pn-natin", text: "natin", type: "pronoun", value: "tayo-ng" },
        { id: "pn-ninyo", text: "ninyo", type: "pronoun", value: "kayo-ng" },
        { id: "pn-nila", text: "nila", type: "pronoun", value: "sila-ng" },
      );
    }
  }

  // Particles
  if (unlockedConcepts.includes("object")) {
    pieces.push(
      { id: "pt-ng", text: "ng", type: "particle" },
      { id: "pt-ang", text: "ang", type: "particle" },
    );
  }

  // Nouns
  if (unlockedConcepts.includes("object")) {
    pieces.push(
      { id: "n-mangga", text: "mangga", type: "noun", value: "mangga" },
      { id: "n-kanin", text: "kanin", type: "noun", value: "kanin" },
      { id: "n-isda", text: "isda", type: "noun", value: "isda" },
      { id: "n-manok", text: "manok", type: "noun", value: "manok" },
      { id: "n-tinapay", text: "tinapay", type: "noun", value: "tinapay" },
      { id: "n-mansanas", text: "mansanas", type: "noun", value: "mansanas" },
    );
  }

  // Time
  if (unlockedConcepts.includes("time")) {
    pieces.push(
      { id: "t-kahapon", text: "kahapon", type: "time", value: "kahapon" },
      { id: "t-ngayon", text: "ngayon", type: "time", value: "ngayon" },
      { id: "t-mamaya", text: "mamaya", type: "time", value: "mamaya" },
      { id: "t-bukas", text: "bukas", type: "time", value: "bukas" },
    );
  }

  // Negation
  if (unlockedConcepts.includes("negation")) {
    pieces.push(
      { id: "neg-hindi", text: "hindi", type: "negation" },
    );
  }

  // Question marker
  if (unlockedConcepts.includes("yes-no")) {
    pieces.push(
      { id: "q-ba", text: "ba", type: "question" },
    );
  }

  // Question words
  if (unlockedConcepts.includes("wh-questions")) {
    pieces.push(
      { id: "q-ano", text: "ano", type: "question", value: "ano" },
      { id: "q-sino", text: "sino", type: "question", value: "sino" },
      { id: "q-saan", text: "saan", type: "question", value: "saan" },
      { id: "q-kailan", text: "kailan", type: "question", value: "kailan" },
      { id: "q-bakit", text: "bakit", type: "question", value: "bakit" },
      { id: "q-paano", text: "paano", type: "question", value: "paano" },
    );
  }

  return pieces;
}

// Color mapping for piece types
const typeColors: Record<string, string> = {
  verb: "text-action border-action/40 bg-action/10",
  pronoun: "text-person border-person/40 bg-person/10",
  noun: "text-describe border-describe/40 bg-describe/10",
  time: "text-time border-time/40 bg-time/10",
  particle: "text-particle border-particle/40 bg-particle/10",
  negation: "text-red-500 border-red-500/40 bg-red-500/10",
  question: "text-question border-question/40 bg-question/10",
};

export default function BuilderPage() {
  const [state, setState] = useState<LearnerState | null>(null);
  const [sentence, setSentence] = useState<BuilderPiece[]>([]);
  const [availablePieces, setAvailablePieces] = useState<BuilderPiece[]>([]);

  useEffect(() => {
    const learnerState = getLearnerState();
    setState(learnerState);
    const unlocked = getUnlockedConcepts(learnerState);
    setAvailablePieces(getAvailablePieces(unlocked));
  }, []);

  const addPiece = (piece: BuilderPiece) => {
    setSentence(prev => [...prev, { ...piece, id: `${piece.id}-${Date.now()}` }]);
  };

  const removePiece = (index: number) => {
    setSentence(prev => prev.filter((_, i) => i !== index));
  };

  const clearSentence = () => {
    setSentence([]);
  };

  // Build the sentence string
  const sentenceText = sentence.map(p => p.text).join(" ");

  // Group pieces by type for display
  const piecesByType = availablePieces.reduce((acc, piece) => {
    if (!acc[piece.type]) acc[piece.type] = [];
    acc[piece.type].push(piece);
    return acc;
  }, {} as Record<string, BuilderPiece[]>);

  const typeLabels: Record<string, string> = {
    verb: "Verbs",
    pronoun: "Pronouns",
    noun: "Objects",
    time: "Time",
    particle: "Particles",
    negation: "Negation",
    question: "Questions",
  };

  const typeOrder = ["negation", "question", "verb", "pronoun", "particle", "noun", "time"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sentence Builder</h1>
        <p className="text-muted">
          Tap pieces to construct sentences.
        </p>
      </div>

      {/* Sentence workspace */}
      <div className="rounded-2xl border border-line bg-card p-4 min-h-[120px]">
        {sentence.length === 0 ? (
          <div className="text-center text-muted py-8">
            Tap words below to build a sentence
          </div>
        ) : (
          <div className="space-y-4">
            {/* Built sentence */}
            <div className="flex flex-wrap gap-2">
              {sentence.map((piece, i) => (
                <button
                  key={piece.id}
                  onClick={() => removePiece(i)}
                  className={`px-3 py-2 rounded-lg border font-medium cursor-pointer transition-all hover:opacity-70 ${typeColors[piece.type]}`}
                >
                  {piece.text}
                  <span className="ml-1 text-xs opacity-50">×</span>
                </button>
              ))}
            </div>

            {/* Full sentence display */}
            <div className="pt-3 border-t border-line/50">
              <div className="text-xl font-semibold">
                {sentenceText.charAt(0).toUpperCase() + sentenceText.slice(1)}
                {sentence.some(p => p.type === "question") ? "?" : "."}
              </div>
            </div>

            {/* Clear button */}
            <button
              onClick={clearSentence}
              className="text-sm text-muted hover:text-foreground cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Available pieces */}
      <div className="space-y-4">
        {typeOrder.map(type => {
          const pieces = piecesByType[type];
          if (!pieces || pieces.length === 0) return null;

          return (
            <div key={type} className="space-y-2">
              <div className="text-xs text-muted uppercase tracking-wide">
                {typeLabels[type]}
              </div>
              <div className="flex flex-wrap gap-2">
                {pieces.map(piece => (
                  <button
                    key={piece.id}
                    onClick={() => addPiece(piece)}
                    className={`px-3 py-2 rounded-lg border font-medium cursor-pointer transition-all hover:scale-105 ${typeColors[piece.type]}`}
                  >
                    {piece.text}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Example sentences */}
      <div className="rounded-2xl border border-line bg-card p-4 space-y-3">
        <div className="text-sm font-medium">Example patterns:</div>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-action">Kumain</span>{" "}
            <span className="text-person">ako</span>{" "}
            <span className="text-particle">ng</span>{" "}
            <span className="text-describe">isda</span>.
            <span className="text-muted ml-2">(I ate fish)</span>
          </div>
          <div>
            <span className="text-action">Kinain</span>{" "}
            <span className="text-person">ko</span>{" "}
            <span className="text-particle">ang</span>{" "}
            <span className="text-describe">isda</span>.
            <span className="text-muted ml-2">(I ate the fish)</span>
          </div>
          <div>
            <span className="text-red-500">Hindi</span>{" "}
            <span className="text-person">ako</span>{" "}
            <span className="text-action">kumain</span>.
            <span className="text-muted ml-2">(I did not eat)</span>
          </div>
          <div>
            <span className="text-action">Kumain</span>{" "}
            <span className="text-person">ka</span>{" "}
            <span className="text-question">ba</span>?
            <span className="text-muted ml-2">(Did you eat?)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
