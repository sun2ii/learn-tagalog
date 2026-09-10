"use client";

import { useState, useEffect, useRef } from "react";
import { render } from "@/languages/tagalog/renderer";
import { QUESTION_WORDS, type QuestionWord } from "@/languages/tagalog/particles";
import { getLearnerState, recordModeRep, recordConceptAttempt } from "@/lib/learner";
import { getUnlockedConcepts } from "@/curriculum/unlock";
import type { SentenceState } from "@/engine/types";
import type { LearnerState } from "@/curriculum/types";

type Exercise = {
  type: "transform_yesno" | "transform_wh" | "identify";
  baseState: SentenceState;
  questionWord?: QuestionWord;
  prompt: string;
  answer: string;
};

// Generate exercises based on unlocked concepts
function generateExercise(unlockedConcepts: string[]): Exercise {
  // Random actor
  const actors = ["ako", "ikaw", "siya", "kami", "tayo", "kayo", "sila"];
  const actor = actors[Math.floor(Math.random() * actors.length)];

  // Random aspect
  const aspects = ["completed", "ongoing", "contemplated"];
  const aspect = aspects[Math.floor(Math.random() * aspects.length)];

  // Random object
  const objects = ["mangga", "kanin", "isda", "manok", "tinapay", "mansanas"];
  const object = objects[Math.floor(Math.random() * objects.length)];

  const baseState: SentenceState = {
    root: "kain",
    aspect,
    actor,
    focus: "actor",
    object,
  };

  const baseRendered = render(baseState);

  // Decide exercise type based on unlocked concepts
  const hasYesNo = unlockedConcepts.includes("yes-no");
  const hasWh = unlockedConcepts.includes("wh-questions");

  if (hasWh && Math.random() > 0.5) {
    // WH question exercise
    const qWords: QuestionWord[] = ["ano", "kailan", "bakit", "saan"];
    const qWord = qWords[Math.floor(Math.random() * qWords.length)];

    const questionState: SentenceState = {
      ...baseState,
      mood: "wh_question",
      questionWord: qWord,
    };
    const questionRendered = render(questionState);

    return {
      type: "transform_wh",
      baseState,
      questionWord: qWord,
      prompt: `Ask "${qWord === "ano" ? "what" : qWord === "kailan" ? "when" : qWord === "bakit" ? "why" : "where"}" about: ${baseRendered.tagalog}`,
      answer: questionRendered.tagalog,
    };
  } else if (hasYesNo) {
    // Yes/No question exercise
    const questionState: SentenceState = {
      ...baseState,
      mood: "yes_no",
    };
    const questionRendered = render(questionState);

    return {
      type: "transform_yesno",
      baseState,
      prompt: `Make this a yes/no question: ${baseRendered.tagalog}`,
      answer: questionRendered.tagalog,
    };
  } else {
    // If no question concepts unlocked, just show question word identification
    return {
      type: "identify",
      baseState,
      prompt: "What question word means 'what'?",
      answer: "Ano",
    };
  }
}

// Question words reference data
const QUESTION_WORD_DATA = [
  { tagalog: "Ano", english: "What", example: "Ano ang pangalan mo?" },
  { tagalog: "Sino", english: "Who", example: "Sino ka?" },
  { tagalog: "Saan", english: "Where", example: "Saan ka pupunta?" },
  { tagalog: "Kailan", english: "When", example: "Kailan ka darating?" },
  { tagalog: "Bakit", english: "Why", example: "Bakit ka malungkot?" },
  { tagalog: "Paano", english: "How", example: "Paano mo nagawa iyan?" },
];

type Mode = "learn" | "drill";

function LearnMode({ onStartDrill }: { onStartDrill: () => void }) {
  return (
    <div className="space-y-6">
      {/* Question words reference */}
      <div className="space-y-3">
        {QUESTION_WORD_DATA.map(qw => (
          <div
            key={qw.tagalog}
            className="rounded-2xl border border-line bg-card p-4"
          >
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-question">{qw.tagalog}</span>
              <span className="text-lg text-muted">{qw.english}</span>
            </div>
            <div className="text-sm text-muted mt-2">{qw.example}</div>
          </div>
        ))}
      </div>

      {/* Yes/No question pattern */}
      <div className="rounded-2xl border border-line bg-card p-4 space-y-3">
        <div className="font-semibold">Yes/No Questions</div>
        <div className="text-sm text-muted">
          Add <span className="text-question font-medium">ba</span> after the verb and pronoun:
        </div>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-muted">Statement:</span>{" "}
            <span className="text-action">Kumain</span> <span className="text-person">ka</span>.
          </div>
          <div>
            <span className="text-muted">Question:</span>{" "}
            <span className="text-action">Kumain</span> <span className="text-person">ka</span> <span className="text-question">ba</span>?
          </div>
        </div>
      </div>

      {/* Start drill button */}
      <button
        onClick={onStartDrill}
        className="w-full rounded-2xl border-2 border-action bg-action/10 p-4 text-center font-semibold text-action cursor-pointer"
      >
        Practice Questions
      </button>
    </div>
  );
}

function DrillMode({ onExit, unlockedConcepts }: { onExit: () => void; unlockedConcepts: string[] }) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [input, setInput] = useState("");
  const [showResult, setShowResult] = useState<"correct" | "incorrect" | null>(null);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setExercise(generateExercise(unlockedConcepts));
  }, []);

  useEffect(() => {
    if (showResult === null) {
      inputRef.current?.focus();
    }
  }, [showResult, exercise]);

  const handleSubmit = () => {
    if (!exercise || !input.trim()) return;

    const normalize = (s: string) =>
      s.toLowerCase()
        .replace(/[.,!?]/g, "")
        .replace(/\s+/g, " ")
        .trim();

    const isCorrect = normalize(input) === normalize(exercise.answer);

    setShowResult(isCorrect ? "correct" : "incorrect");
    setStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    // Record attempt
    recordModeRep("questions", isCorrect, 0);
    if (unlockedConcepts.includes("wh-questions")) {
      recordConceptAttempt("wh-questions", isCorrect);
    } else if (unlockedConcepts.includes("yes-no")) {
      recordConceptAttempt("yes-no", isCorrect);
    }
  };

  const handleNext = () => {
    setExercise(generateExercise(unlockedConcepts));
    setInput("");
    setShowResult(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (showResult !== null) {
        handleNext();
      } else {
        handleSubmit();
      }
    }
  };

  if (!exercise) {
    return <div className="text-center py-12 text-muted">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm text-muted">
        <button onClick={onExit} className="text-action cursor-pointer">← Exit</button>
        <span>{stats.correct}/{stats.total} correct</span>
      </div>

      {/* Prompt */}
      <div className="rounded-2xl border border-line bg-card p-6">
        <div className="text-sm text-muted mb-2">Transform this sentence:</div>
        <div className="text-xl font-semibold">{exercise.prompt}</div>
      </div>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type the question..."
        disabled={showResult !== null}
        className="w-full px-4 py-3 rounded-xl border border-line bg-card text-lg text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-action"
      />

      {/* Result */}
      {showResult && (
        <div className={`rounded-2xl p-4 ${showResult === "correct" ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"}`}>
          <div className={`font-semibold ${showResult === "correct" ? "text-green-500" : "text-red-500"}`}>
            {showResult === "correct" ? "Correct!" : "Not quite"}
          </div>
          {showResult === "incorrect" && (
            <div className="mt-2">
              <div className="text-sm text-muted">Expected:</div>
              <div className="text-lg font-medium">{exercise.answer}</div>
            </div>
          )}
        </div>
      )}

      {/* Action button */}
      {showResult === null ? (
        <button
          onClick={handleSubmit}
          disabled={!input.trim()}
          className="w-full rounded-2xl bg-action p-4 text-center font-semibold text-white cursor-pointer disabled:opacity-50"
        >
          Check
        </button>
      ) : (
        <button
          onClick={handleNext}
          className="w-full rounded-2xl bg-action p-4 text-center font-semibold text-white cursor-pointer"
        >
          Next
        </button>
      )}
    </div>
  );
}

export default function QuestionsPage() {
  const [state, setState] = useState<LearnerState | null>(null);
  const [mode, setMode] = useState<Mode>("learn");
  const [unlockedConcepts, setUnlockedConcepts] = useState<string[]>([]);

  useEffect(() => {
    const learnerState = getLearnerState();
    setState(learnerState);
    setUnlockedConcepts(getUnlockedConcepts(learnerState));
  }, []);

  const canDrill = unlockedConcepts.includes("yes-no") || unlockedConcepts.includes("wh-questions");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Questions</h1>
        <p className="text-muted">
          Learn to ask in Tagalog.
        </p>
      </div>

      {mode === "learn" ? (
        <LearnMode onStartDrill={() => canDrill && setMode("drill")} />
      ) : (
        <DrillMode
          onExit={() => setMode("learn")}
          unlockedConcepts={unlockedConcepts}
        />
      )}

      {!canDrill && mode === "learn" && (
        <div className="rounded-2xl border border-line/50 bg-card/50 p-4 text-center text-muted">
          <div className="text-sm">Complete earlier concepts to unlock question drills.</div>
        </div>
      )}
    </div>
  );
}
