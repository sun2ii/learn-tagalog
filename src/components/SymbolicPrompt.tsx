"use client";
import type { SentenceState } from "@/engine/types";
import { ASPECT_SYMBOLS, NOUN_SYMBOLS, PRONOUN_SYMBOLS, TIME_SYMBOLS, NG_SYMBOL } from "@/languages/tagalog/symbols";

/* The symbolic prompt: meaning without English.
      ×
   kain IU++ → 🥭 <
   Extended for the newer moves: ¬ (hindi), trailing ? (ba), why? (question word). */

const WH_EN: Record<string, string> = { ano: "what?", sino: "who?", saan: "where?", kailan: "when?", bakit: "why?", paano: "how?" };

export function SymbolicPrompt({ state }: { state: SentenceState }) {
  const focus = state.focus || "actor";
  const q = state.mood === "wh_question" ? state.questionWord : undefined;
  const yesNo = state.mood === "yes_no";
  const neg = state.polarity === "negative";
  const objectFocus = focus === "object" || q === "ano";

  return (
    <div className="flex flex-wrap items-baseline justify-center gap-x-[0.45em] text-[36px] font-semibold leading-none tracking-tight md:text-[46px]">
      {q && <span data-role="question" className="mr-[0.2em] text-[0.75em] font-medium">{WH_EN[q]}</span>}
      {neg && <span data-role="negation" className="text-[0.9em]">¬</span>}
      <span className="relative inline-block pt-[0.55em]" data-role="verb">
        <span className="absolute left-1/2 top-0 -translate-x-1/2 text-[0.5em] font-bold">{ASPECT_SYMBOLS[state.aspect] ?? "?"}</span>
        <span className="tl font-medium">{state.root}</span>
      </span>
      {q !== "sino" && (
        <span data-role="actor" className={`font-sans ${focus === "actor" && !objectFocus ? "underline decoration-[0.08em] underline-offset-[0.18em]" : ""}`}>
          {PRONOUN_SYMBOLS[state.actor] ?? state.actor}
        </span>
      )}
      {state.object && (
        <>
          <span className="text-faint">{NG_SYMBOL}</span>
          <span className={objectFocus ? "underline decoration-[0.08em] underline-offset-[0.12em] decoration-[color:var(--role-thing)]" : ""}>
            {NOUN_SYMBOLS[state.object] ?? state.object}
          </span>
        </>
      )}
      {state.time && q !== "kailan" && <span data-role="time" className="font-sans">{TIME_SYMBOLS[state.time] ?? state.time}</span>}
      {yesNo && <span data-role="question">?</span>}
    </div>
  );
}
