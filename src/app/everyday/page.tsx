"use client";

import { useState, useEffect, useCallback } from "react";
import { EVERYDAY_PHRASES, type PhraseGroup, type Phrase } from "@/content/everyday";
import { rateCard, getCard, getDueCardIds, getLearnerState } from "@/lib/learner";

type Mode = "browse" | "drill";

function PhraseCard({ group, onStartDrill }: { group: PhraseGroup; onStartDrill: (groupId: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border border-line bg-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between cursor-pointer"
      >
        <div className="text-left">
          <span className="text-lg font-semibold">{group.name}</span>
          <span className="text-sm text-muted ml-2">{group.phrases.length} phrases</span>
        </div>
        <span className="text-muted text-xl">{expanded ? "−" : "+"}</span>
      </button>

      {expanded && (
        <div className="border-t border-line">
          {/* Drill button */}
          <button
            onClick={() => onStartDrill(group.id)}
            className="w-full p-3 text-center text-action font-medium border-b border-line/50 hover:bg-action/5 cursor-pointer"
          >
            Practice these phrases
          </button>

          {group.phrases.map((phrase, i) => (
            <div
              key={i}
              className={`p-4 ${i > 0 ? "border-t border-line/50" : ""}`}
            >
              <div className="text-lg font-semibold">{phrase.tagalog}</div>
              <div className="text-sm text-muted">{phrase.english}</div>
              {phrase.indonesian && (
                <div className="text-xs text-muted/70 mt-0.5">{phrase.indonesian}</div>
              )}
              {phrase.note && (
                <div className="text-xs text-muted/60 mt-1 italic">{phrase.note}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DrillMode({
  groupId,
  onExit
}: {
  groupId: string | null;
  onExit: () => void;
}) {
  // Get phrases to drill
  const phrases = groupId
    ? EVERYDAY_PHRASES.find(g => g.id === groupId)?.phrases || []
    : EVERYDAY_PHRASES.flatMap(g => g.phrases);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [shuffledPhrases, setShuffledPhrases] = useState<Phrase[]>([]);

  // Shuffle on mount
  useEffect(() => {
    const shuffled = [...phrases].sort(() => Math.random() - 0.5);
    setShuffledPhrases(shuffled);
  }, []);

  const currentPhrase = shuffledPhrases[currentIndex];
  const isComplete = currentIndex >= shuffledPhrases.length;

  const handleRate = useCallback((gotIt: boolean) => {
    if (!currentPhrase) return;

    // Record for spaced repetition
    const cardId = `phrase:${currentPhrase.tagalog}`;
    rateCard(cardId, gotIt);

    setStats(prev => ({
      correct: prev.correct + (gotIt ? 1 : 0),
      total: prev.total + 1,
    }));

    // If incorrect, add phrase back to end of queue
    if (!gotIt) {
      setShuffledPhrases(prev => [...prev, currentPhrase]);
    }

    // Move to next
    setCurrentIndex(prev => prev + 1);
    setShowAnswer(false);
  }, [currentPhrase]);

  // Keyboard shortcuts
  // Space = show answer
  // 1 or left arrow = Again (incorrect)
  // 2 or right arrow = Got it (correct)
  // Escape = exit
  useEffect(() => {
    if (isComplete) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "Escape") {
        onExit();
        return;
      }

      if (!showAnswer) {
        // Space or Enter to reveal
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          setShowAnswer(true);
        }
      } else {
        // After answer is shown
        if (e.key === "1" || e.key === "ArrowLeft") {
          e.preventDefault();
          handleRate(false);
        } else if (e.key === "2" || e.key === "ArrowRight" || e.key === " " || e.key === "Enter") {
          e.preventDefault();
          handleRate(true);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAnswer, isComplete, handleRate, onExit]);

  if (shuffledPhrases.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted">No phrases to practice</div>
        <button onClick={onExit} className="mt-4 text-action cursor-pointer">
          Go back
        </button>
      </div>
    );
  }

  if (isComplete) {
    const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">✓</div>
          <h2 className="text-2xl font-bold">Session Complete</h2>
          <p className="text-muted mt-2">{stats.correct}/{stats.total} correct ({accuracy}%)</p>
        </div>

        <button
          onClick={() => {
            setCurrentIndex(0);
            setShowAnswer(false);
            setStats({ correct: 0, total: 0 });
            setShuffledPhrases([...phrases].sort(() => Math.random() - 0.5));
          }}
          className="w-full rounded-2xl border-2 border-action bg-action/10 p-4 text-center font-semibold text-action cursor-pointer"
        >
          Practice Again
        </button>

        <button
          onClick={onExit}
          className="w-full rounded-2xl border border-line bg-card p-4 text-center font-semibold cursor-pointer"
        >
          Back to Phrases
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-muted">
        <button onClick={onExit} className="text-action cursor-pointer">← Exit</button>
        <span>{currentIndex + 1} / {shuffledPhrases.length}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-action rounded-full transition-all"
          style={{ width: `${((currentIndex + 1) / shuffledPhrases.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-line bg-card p-6 min-h-[200px] flex flex-col justify-center">
        {/* Prompt (English) */}
        <div className="text-center">
          <div className="text-sm text-muted mb-2">How do you say:</div>
          <div className="text-2xl font-semibold">{currentPhrase.english}</div>
        </div>

        {/* Answer */}
        {showAnswer && (
          <div className="mt-6 pt-6 border-t border-line text-center">
            <div className="text-2xl font-bold text-action">{currentPhrase.tagalog}</div>
            {currentPhrase.indonesian && (
              <div className="text-sm text-muted mt-1">{currentPhrase.indonesian}</div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      {!showAnswer ? (
        <button
          onClick={() => setShowAnswer(true)}
          className="w-full rounded-2xl bg-action p-4 text-center font-semibold text-white cursor-pointer"
        >
          Show Answer <span className="text-white/60 text-sm ml-2">[space]</span>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleRate(false)}
            className="rounded-2xl border-2 border-red-500/50 bg-red-500/10 p-4 text-center font-semibold text-red-500 cursor-pointer"
          >
            Again <span className="text-red-500/60 text-sm ml-1">[1/←]</span>
          </button>
          <button
            onClick={() => handleRate(true)}
            className="rounded-2xl border-2 border-green-500/50 bg-green-500/10 p-4 text-center font-semibold text-green-500 cursor-pointer"
          >
            Got it <span className="text-green-500/60 text-sm ml-1">[2/→]</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function EverydayPage() {
  const [mode, setMode] = useState<Mode>("browse");
  const [drillGroupId, setDrillGroupId] = useState<string | null>(null);

  const handleStartDrill = (groupId: string) => {
    setDrillGroupId(groupId);
    setMode("drill");
  };

  const handleExitDrill = () => {
    setMode("browse");
    setDrillGroupId(null);
  };

  if (mode === "drill") {
    return (
      <div className="space-y-6">
        <DrillMode groupId={drillGroupId} onExit={handleExitDrill} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Everyday Tagalog</h1>
        <p className="text-muted">
          Phrases you can use today.
        </p>
      </div>

      {/* Quick drill all */}
      <button
        onClick={() => handleStartDrill("")}
        className="w-full rounded-2xl border-2 border-action bg-action/10 p-4 text-center font-semibold text-action cursor-pointer"
      >
        Practice All Phrases
      </button>

      <div className="space-y-3">
        {EVERYDAY_PHRASES.map((group) => (
          <PhraseCard
            key={group.id}
            group={group}
            onStartDrill={handleStartDrill}
          />
        ))}
      </div>
    </div>
  );
}
