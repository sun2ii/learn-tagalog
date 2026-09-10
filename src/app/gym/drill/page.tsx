"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import type { Exercise } from "@/engine/types";
import { generateSession, checkAnswer, getStage } from "@/engine/session";
import { render } from "@/languages/tagalog/renderer";
import { recordRep, startSession } from "@/engine/stats";
import type { SentenceState } from "@/engine/types";
import {
  PRONOUN_DATA,
  PRONOUN_LIST,
  PRONOUN_SYMBOLS,
  VERB_DATA,
  NOUN_DATA,
  NOUN_SYMBOLS,
  TIME_DATA,
  TIME_LIST,
  TIME_SYMBOLS,
  ASPECT_SYMBOLS,
  NG_SYMBOL,
} from "@/languages/tagalog/symbols";

// Prompt component with symbolic aspect/time
// Layout:
//        ×
//   kain IU++ → 🍎 ●
function SymbolicPrompt({ state }: { state: SentenceState }) {
  const pronounSymbol = PRONOUN_SYMBOLS[state.actor] || state.actor;
  const objectSymbol = state.object ? NOUN_SYMBOLS[state.object] || state.object : null;
  const focus = state.focus || "actor";

  const aspectSymbol = ASPECT_SYMBOLS[state.aspect] || "?";
  const timeSymbol = state.time ? TIME_SYMBOLS[state.time] || "" : "";

  return (
    <div className="flex items-baseline justify-center gap-2">
      {/* Verb with aspect symbol floating above */}
      <span className="relative text-action font-semibold">
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-sm">{aspectSymbol}</span>
        kain
      </span>
      {" "}
      <span className={focus === "actor" ? "text-person underline decoration-2" : ""}>
        {pronounSymbol}
      </span>
      {objectSymbol && (
        <>
          {" "}
          <span className="text-muted">{NG_SYMBOL}</span>
          {" "}
          <span className={`text-describe ${focus === "object" ? "underline decoration-2" : ""}`}>
            {objectSymbol}
          </span>
        </>
      )}
      {/* Time symbol at the end */}
      {timeSymbol && (
        <>
          {" "}
          <span className="text-time text-2xl">{timeSymbol}</span>
        </>
      )}
    </div>
  );
}

function DrillContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const stageId = searchParams.get("stage") || "1";
  const repCount = parseInt(searchParams.get("reps") || "25", 10);

  const stage = getStage(stageId);

  // Phases: "review" -> "drill" -> "complete"
  const [phase, setPhase] = useState<"review" | "drill" | "complete">("review");

  // Drill state
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState("");
  const [showResult, setShowResult] = useState<"correct" | "incorrect" | null>(null);
  const [sessionStats, setSessionStats] = useState({ correct: 0, corrected: 0 });
  const [startTime, setStartTime] = useState(0);
  const [repStartTime, setRepStartTime] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize exercises when starting drill
  const startDrill = useCallback(() => {
    if (!stage) return;
    // All exercises are produce mode - just typing
    const exs = generateSession(stageId, repCount, ["produce"]);
    setExercises(exs);
    setStartTime(Date.now());
    setRepStartTime(Date.now());
    setPhase("drill");
    startSession();
  }, [stage, stageId, repCount]);

  // Focus input when drill starts
  useEffect(() => {
    if (phase === "drill") {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [phase, currentIndex]);

  const currentExercise = exercises[currentIndex];

  const advance = useCallback(() => {
    if (currentIndex >= exercises.length - 1) {
      setPhase("complete");
      return;
    }
    setCurrentIndex((i) => i + 1);
    setInput("");
    setShowResult(null);
    setRepStartTime(Date.now());
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [currentIndex, exercises.length]);

  const handleSubmit = useCallback(() => {
    if (!currentExercise) return;

    const responseTime = Date.now() - repStartTime;

    if (showResult) {
      advance();
      return;
    }

    const isCorrect = checkAnswer(input, currentExercise.current);
    setShowResult(isCorrect ? "correct" : "incorrect");

    const mistakeKey = !isCorrect && currentExercise.diff
      ? `${currentExercise.diff.dimension}:${currentExercise.diff.to}`
      : undefined;
    recordRep(isCorrect, responseTime, mistakeKey);

    setSessionStats((s) => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      corrected: s.corrected + (isCorrect ? 0 : 1),
    }));

    // Don't auto-advance - wait for user to press Enter again
  }, [currentExercise, input, showResult, advance, repStartTime]);

  // Global keyboard handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.push("/gym");
        return;
      }

      if (phase === "review" && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        startDrill();
        return;
      }

      if (phase === "drill" && e.key === "Enter") {
        e.preventDefault();
        handleSubmit();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, router, startDrill, handleSubmit]);

  if (!stage) {
    return <div className="text-center text-muted py-12">Unknown stage</div>;
  }

  // PHASE: Review - show all patterns once
  if (phase === "review") {
    const isFocusStage = stageId === "2";

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => router.push("/gym")} className="text-muted hover:text-foreground text-xl cursor-pointer">
            &times;
          </button>
          <div className="text-lg font-semibold">{stage.name}</div>
          <div className="w-6" />
        </div>

        {/* Stage 2: Focus/Voice explanation */}
        {isFocusStage && (
          <div className="space-y-3">
            <div className="text-xs text-muted uppercase tracking-wide">Core concept</div>
            <div className="rounded-xl border border-line bg-card p-4 space-y-4">
              <div className="text-center text-lg">
                <span className="text-person font-semibold">ACTOR</span>
                <span className="mx-2">→</span>
                <span className="text-action font-semibold">EAT</span>
                <span className="mx-2">→</span>
                <span className="text-thing font-semibold">OBJECT</span>
              </div>
              <div className="text-sm text-muted text-center">
                Same event. Different focus changes the sentence.
              </div>
            </div>
          </div>
        )}

        {/* Actor-focus verbs */}
        <div className="space-y-2">
          <div className="text-xs text-muted uppercase tracking-wide">
            {isFocusStage ? "Actor Focus (ako/ka/siya...)" : "Verb: kain (makan)"}
          </div>
          <div className="flex gap-2">
            {VERB_DATA.map(({ form, symbol, label }) => (
              <div key={form} className="flex-1 text-center px-3 py-3 rounded-lg border border-action/30 bg-action/10">
                <div className="font-semibold text-action text-lg">{form}</div>
                <div className="text-xs text-action/70">{symbol} {label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Object-focus verbs (Stage 2 only) */}
        {isFocusStage && (
          <div className="space-y-2">
            <div className="text-xs text-muted uppercase tracking-wide">Object Focus (ko/mo/niya...)</div>
            <div className="flex gap-2">
              {[
                { form: "kinain", symbol: "×", label: "completed" },
                { form: "kinakain", symbol: "○", label: "ongoing" },
                { form: "kakainin", symbol: "?", label: "future" },
              ].map(({ form, symbol, label }) => (
                <div key={form} className="flex-1 text-center px-3 py-3 rounded-lg border border-question/30 bg-question/10">
                  <div className="font-semibold text-question text-lg">{form}</div>
                  <div className="text-xs text-question/70">{symbol} {label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pronouns */}
        <div className="space-y-2">
          <div className="text-xs text-muted uppercase tracking-wide">
            {isFocusStage ? "Pronouns: ang (topic) vs ng (agent)" : "Pronouns"}
          </div>
          {isFocusStage ? (
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-center px-2 py-1.5 rounded-md border border-person/30 bg-person/10">
                <div className="font-medium text-person">ako / ko</div>
              </div>
              <div className="text-center px-2 py-1.5 rounded-md border border-person/30 bg-person/10">
                <div className="font-medium text-person">ka / mo</div>
              </div>
              <div className="text-center px-2 py-1.5 rounded-md border border-person/30 bg-person/10">
                <div className="font-medium text-person">siya / niya</div>
              </div>
              <div className="text-center px-2 py-1.5 rounded-md border border-person/30 bg-person/10">
                <div className="font-medium text-person">kami / namin</div>
              </div>
              <div className="text-center px-2 py-1.5 rounded-md border border-person/30 bg-person/10">
                <div className="font-medium text-person">tayo / natin</div>
              </div>
              <div className="text-center px-2 py-1.5 rounded-md border border-person/30 bg-person/10">
                <div className="font-medium text-person">kayo / ninyo</div>
              </div>
              <div className="text-center px-2 py-1.5 rounded-md border border-person/30 bg-person/10 col-span-2">
                <div className="font-medium text-person">sila / nila</div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {PRONOUN_DATA.map((row, i) => (
                <div key={i} className="flex gap-2">
                  {row.map(({ form, symbol }) => (
                    <div key={form} className="flex-1 text-center px-2 py-2 rounded-md border border-person/30 bg-person/10">
                      <div className="font-medium text-person">{form}</div>
                      <div className="text-[10px] text-person/70">{symbol}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Objects */}
        {stage.objects.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-muted uppercase tracking-wide">
              {isFocusStage ? "Objects: ng (indefinite) vs ang (definite)" : `Objects (ng ${NG_SYMBOL})`}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {NOUN_DATA.map((n) => (
                <div key={n.tagalog} className="text-center px-2 py-2 rounded-md border border-thing/30 bg-thing/10">
                  <div className="font-medium text-thing">{n.tagalog}</div>
                  <div className="text-[10px] text-thing/70">{n.symbol}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Time (if stage includes them) */}
        {stage.allowTime && (
          <div className="space-y-2">
            <div className="text-xs text-muted uppercase tracking-wide">Time</div>
            <div className="space-y-2">
              {TIME_DATA.map((row, i) => (
                <div key={i} className="flex gap-2">
                  {row.map((t) => (
                    <div key={t.tagalog} className="flex-1 text-center px-2 py-2 rounded-md border border-time/30 bg-time/10">
                      <div className="font-medium text-time">{t.tagalog}</div>
                      <div className="text-[10px] text-time/70">{t.symbol}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Example sentences */}
        <div className="space-y-2">
          <div className="text-xs text-muted uppercase tracking-wide">
            {isFocusStage ? "Same event, different focus" : "Pattern"}
          </div>
          <div className="rounded-xl border border-line bg-card p-4 space-y-3">
            {isFocusStage ? (
              <>
                <div className="text-center text-sm text-muted mb-2">
                  Ben → eat → fish
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted">Focus: ACTOR (Ben)</div>
                  <div className="text-lg font-semibold">Kumain <span className="text-person">ako</span> ng isda.</div>
                </div>
                <div className="border-t border-line my-2" />
                <div className="space-y-1">
                  <div className="text-xs text-muted">Focus: OBJECT (fish)</div>
                  <div className="text-lg font-semibold">Kinain <span className="text-person">ko</span> ang isda.</div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="text-sm text-muted">Aku udah makan ikan kemarin.</div>
                  <div className="text-lg font-semibold">Kumain ako ng isda kahapon.</div>
                </div>
                <div>
                  <div className="text-sm text-muted">Dia lagi makan mangga sekarang.</div>
                  <div className="text-lg font-semibold">Kumakain siya ng mangga ngayon.</div>
                </div>
                <div>
                  <div className="text-sm text-muted">Kita bakal makan nasi nanti.</div>
                  <div className="text-lg font-semibold">Kakain tayo ng kanin mamaya.</div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={startDrill}
          className="w-full rounded-xl bg-action py-4 text-xl font-semibold text-white cursor-pointer"
        >
          Start {repCount} reps
        </button>
      </div>
    );
  }

  // PHASE: Complete
  if (phase === "complete") {
    const duration = Math.round((Date.now() - startTime) / 1000);
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="text-center">
          <div className="text-6xl font-bold">{repCount}</div>
          <div className="text-muted">reps complete</div>
        </div>
        <div className="grid grid-cols-2 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-describe">{sessionStats.correct}</div>
            <div className="text-sm text-muted">correct</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-action">{sessionStats.corrected}</div>
            <div className="text-sm text-muted">corrected</div>
          </div>
        </div>
        <div className="text-muted">
          {minutes > 0 ? `${minutes}m ` : ""}{seconds}s
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push("/gym")}
            className="rounded-xl border border-line px-6 py-3 font-semibold cursor-pointer"
          >
            Done
          </button>
          <button
            onClick={() => window.location.reload()}
            className="rounded-xl bg-action px-6 py-3 font-semibold text-white cursor-pointer"
          >
            Again
          </button>
        </div>
      </div>
    );
  }

  // PHASE: Drill
  if (!currentExercise) {
    return <div className="text-center text-muted py-12">Loading...</div>;
  }

  const rendered = render(currentExercise.current);
  const hasObjects = stage?.objects && stage.objects.length > 0;
  const hasTime = stage?.allowTime;
  const isFocusStage = stageId === "2";
  const currentFocus = currentExercise.current.focus || "actor";

  return (
    <div className="flex flex-col min-h-[70vh]">
      {/* Close button - top left */}
      <div className="mb-2">
        <button onClick={() => router.push("/gym")} className="text-muted hover:text-foreground text-2xl cursor-pointer">
          &times;
        </button>
      </div>

      {/* Main content - centered vertically */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-4">
        {/* Counter - right above prompt */}
        <div className="text-3xl font-bold">
          {currentIndex + 1}<span className="text-muted font-normal">/{exercises.length}</span>
        </div>

        {/* Stage 2: Event diagram with focus indicator */}
        {isFocusStage && (
          <div className="rounded-xl border border-line bg-card px-6 py-3 mb-2">
            <div className="flex items-center justify-center gap-3 text-lg">
              <span className={`font-semibold ${currentFocus === "actor" ? "text-person underline decoration-2" : "text-muted"}`}>
                {currentExercise.current.actor}
              </span>
              <span className="text-muted">→</span>
              <span className="text-action font-semibold">kain</span>
              <span className="text-muted">→</span>
              <span className={`font-semibold ${currentFocus === "object" ? "text-thing underline decoration-2" : "text-muted"}`}>
                {currentExercise.current.object || ""}
              </span>
            </div>
            <div className="text-center text-xs text-muted mt-1">
              Focus: <span className={currentFocus === "actor" ? "text-person font-semibold" : "text-thing font-semibold"}>
                {currentFocus === "actor" ? "ACTOR" : "OBJECT"}
              </span>
            </div>
          </div>
        )}

        {/* Symbolic prompt (only for Stage 1) - with focus highlighting */}
        {!isFocusStage && (
          <div className="text-center text-2xl md:text-3xl font-semibold whitespace-nowrap">
            <SymbolicPrompt state={currentExercise.current} />
          </div>
        )}

        {/* Full input for all stages */}
        <div className="w-full max-w-md md:max-w-xl relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={showResult !== null}
            className={`w-full rounded-xl border-2 px-4 py-4 text-2xl text-center text-gray-900 bg-white outline-none transition-colors ${
              showResult === "correct"
                ? "border-describe bg-describe/10"
                : showResult === "incorrect"
                ? "border-action bg-action/10"
                : "border-line focus:border-foreground/50"
            }`}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
          />
          {showResult === "correct" && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-describe">
              &#10003;
            </div>
          )}
        </div>

        {/* Check button */}
        {showResult === null && (
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="w-full max-w-md md:max-w-xl rounded-xl bg-foreground py-3 text-lg font-semibold text-background disabled:opacity-40 cursor-pointer"
          >
            Check
          </button>
        )}

        {/* Show correct answer on incorrect */}
        {showResult === "incorrect" && (
          <div className="text-center">
            <div className="text-xl font-bold text-describe">{rendered.tagalog}</div>
          </div>
        )}

        {/* Next button after result */}
        {showResult !== null && (
          <button
            onClick={advance}
            className="w-full max-w-md md:max-w-xl rounded-xl bg-foreground py-3 text-lg font-semibold text-background cursor-pointer"
          >
            Next
          </button>
        )}

        {/* Reference strips - consistent row bars */}
        <div className="mt-8 w-full space-y-2">
          {/* Verbs row */}
          <div className="flex items-stretch rounded-lg border border-action/20 overflow-hidden">
            {VERB_DATA.map(({ form, symbol, label }, i) => (
              <button
                key={form}
                type="button"
                onClick={() => setInput(prev => prev ? `${prev} ${form}` : form)}
                disabled={showResult !== null}
                className={`flex-1 text-center px-4 py-3 bg-action/10 cursor-pointer disabled:opacity-50 ${i > 0 ? "border-l border-action/20" : ""}`}
              >
                <div className="text-lg font-semibold text-action">{form}</div>
                <div className="text-sm text-action/60">{symbol} {label}</div>
              </button>
            ))}
          </div>

          {/* Object-focus verbs (Stage 2 only) */}
          {isFocusStage && (
            <div className="flex items-stretch rounded-lg border border-question/20 overflow-hidden">
              {[
                { form: "kinain", symbol: "×", label: "completed" },
                { form: "kinakain", symbol: "○", label: "ongoing" },
                { form: "kakainin", symbol: "?", label: "future" },
              ].map(({ form, symbol, label }, i) => (
                <button
                  key={form}
                  type="button"
                  onClick={() => setInput(prev => prev ? `${prev} ${form}` : form)}
                  disabled={showResult !== null}
                  className={`flex-1 text-center px-4 py-3 bg-question/10 cursor-pointer disabled:opacity-50 ${i > 0 ? "border-l border-question/20" : ""}`}
                >
                  <div className="text-lg font-semibold text-question">{form}</div>
                  <div className="text-sm text-question/60">{symbol} {label}</div>
                </button>
              ))}
            </div>
          )}

          {/* Pronouns row */}
          <div className="flex items-stretch rounded-lg border border-person/20 overflow-hidden">
            {PRONOUN_LIST.map(({ form, symbol }, i) => (
              <button
                key={form}
                type="button"
                onClick={() => setInput(prev => prev ? `${prev} ${form}` : form)}
                disabled={showResult !== null}
                className={`flex-1 text-center px-2 py-3 bg-person/10 cursor-pointer disabled:opacity-50 ${i > 0 ? "border-l border-person/20" : ""}`}
              >
                <div className="text-base font-medium text-person">{form}</div>
                <div className="text-xs text-person/60">{symbol}</div>
              </button>
            ))}
          </div>

          {/* Objects row - using describe color (green) instead of thing (same as time) */}
          {hasObjects && (
            <div className="flex items-stretch rounded-lg border border-describe/20 overflow-hidden">
              <button
                type="button"
                onClick={() => setInput(prev => prev ? `${prev} ng` : "ng")}
                disabled={showResult !== null}
                className="text-center px-4 py-3 bg-card cursor-pointer disabled:opacity-50"
              >
                <div className="text-base font-medium">ng</div>
                <div className="text-xs text-muted">{NG_SYMBOL}</div>
              </button>
              {isFocusStage && (
                <button
                  type="button"
                  onClick={() => setInput(prev => prev ? `${prev} ang` : "ang")}
                  disabled={showResult !== null}
                  className="text-center px-4 py-3 bg-card border-l border-line cursor-pointer disabled:opacity-50"
                >
                  <div className="text-base font-medium">ang</div>
                  <div className="text-xs text-muted">the</div>
                </button>
              )}
              {NOUN_DATA.map((n) => (
                <button
                  key={n.tagalog}
                  type="button"
                  onClick={() => setInput(prev => prev ? `${prev} ${n.tagalog}` : n.tagalog)}
                  disabled={showResult !== null}
                  className="flex-1 text-center px-2 py-3 bg-describe/10 border-l border-describe/20 cursor-pointer disabled:opacity-50"
                >
                  <div className="text-base font-medium text-describe">{n.tagalog}</div>
                  <div className="text-xs text-describe/60">{n.symbol}</div>
                </button>
              ))}
            </div>
          )}

          {/* Time row - keeping time color (amber/yellow) */}
          {hasTime && (
            <div className="flex items-stretch rounded-lg border border-time/20 overflow-hidden">
              {TIME_LIST.map(({ tagalog, symbol }, i) => (
                <button
                  key={tagalog}
                  type="button"
                  onClick={() => setInput(prev => prev ? `${prev} ${tagalog}` : tagalog)}
                  disabled={showResult !== null}
                  className={`flex-1 text-center px-4 py-3 bg-time/10 cursor-pointer disabled:opacity-50 ${i > 0 ? "border-l border-time/20" : ""}`}
                >
                  <div className="text-base font-medium text-time">{tagalog}</div>
                  <div className="text-xs text-time/60">{symbol}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DrillPage() {
  return (
    <Suspense fallback={<div className="text-center text-muted py-12">Loading...</div>}>
      <DrillContent />
    </Suspense>
  );
}
