"use client";
import type { ReactNode } from "react";
import type { SentencePart } from "@/languages/tagalog/renderer";
import type { SentenceState } from "@/engine/types";

/* ------------------------------------------------------------------
   Sentence views. Every screen that shows a Tagalog sentence with
   structure goes through these, so roles look the same everywhere.
   ------------------------------------------------------------------ */

export type RoleKey = SentencePart["dimension"];

const ASPECT_LABEL: Record<string, string> = {
  completed: "1 · done",
  ongoing: "½ · ongoing",
  contemplated: "0 · not yet",
};

const Q_LABEL: Record<string, string> = {
  ano: "what", sino: "who", saan: "where", kailan: "when", bakit: "why", paano: "how",
  ba: "yes / no",
};

/** Short role label for one part, given the whole state for context. */
export function roleLabel(part: SentencePart, state?: SentenceState): string {
  switch (part.dimension) {
    case "verb": {
      const asp = state ? ASPECT_LABEL[state.aspect] ?? state.aspect : "";
      const focus = state?.focus === "object" ? " · obj. focus" : "";
      return asp ? `action ${asp}${focus}` : "action";
    }
    case "actor":
      return state?.focus === "object" ? "who · ng-form" : "who";
    case "object":
      return state?.focus === "object" ? "what · in focus" : "what";
    case "particle":
      return part.text.toLowerCase() === "ang" ? "marker · focus" : "marker";
    case "time":
      return "when";
    case "negation":
      return "not";
    case "question":
      return Q_LABEL[(part.key ?? part.text).toLowerCase()] ?? "question";
  }
}

const SIZE = {
  sm: "text-[22px] md:text-[24px]",
  md: "text-[30px] md:text-[36px]",
  lg: "text-[36px] md:text-[48px]",
};

/** A rendered sentence as large, colored Tagalog. Optional role labels under each piece. */
export function Anatomy({
  parts, state, showRoles = false, size = "md", punctuation, className = "", colored = true, align = "center",
}: {
  parts: SentencePart[]; state?: SentenceState; showRoles?: boolean; size?: keyof typeof SIZE;
  punctuation?: string; className?: string; colored?: boolean; align?: "center" | "left";
}) {
  const p = punctuation ?? (state?.mood && state.mood !== "statement" ? "?" : ".");
  return (
    <div className={`flex flex-wrap items-end gap-x-[0.35em] gap-y-3 ${align === "center" ? "justify-center" : ""} ${SIZE[size]} ${className}`}>
      {parts.map((part, i) => (
        <span key={i} className="flex flex-col items-center">
          <span className="tl font-medium leading-none" data-role={colored ? part.dimension : undefined} data-aspect={colored && part.dimension === "verb" ? state?.aspect : undefined}>
            {part.text}{i === parts.length - 1 ? <span className="text-foreground">{p}</span> : null}
          </span>
          {showRoles && (
            <span className="mt-2 whitespace-nowrap font-sans text-[10.5px] font-semibold uppercase tracking-[0.1em] text-faint animate-rise" style={{ animationDelay: `${i * 45}ms` }}>
              {roleLabel(part, state)}
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

/** Plain Tagalog line, uncolored, for prompts you must transform. */
export function Line({ text, size = "md", muted = false, className = "" }: { text: string; size?: keyof typeof SIZE; muted?: boolean; className?: string }) {
  return <div className={`tl font-medium leading-tight ${SIZE[size]} ${muted ? "text-muted" : ""} ${className}`}>{text}</div>;
}

/* ---------------- Transformation diff ---------------- */

export type DiffStatus = "same" | "added" | "moved";
const norm = (s: string) => s.toLowerCase().replace(/[.,!?]/g, "");

/** For each part of `to`, say whether it is new, moved, or unchanged relative to `from`. */
export function diffParts(from: SentencePart[], to: SentencePart[]): DiffStatus[] {
  const a = from.map((p) => norm(p.text));
  const b = to.map((p) => norm(p.text));
  const inA = new Map<string, number>();
  a.forEach((t) => inA.set(t, (inA.get(t) ?? 0) + 1));
  const status: DiffStatus[] = b.map((t) => {
    const n = inA.get(t) ?? 0;
    if (n > 0) { inA.set(t, n - 1); return "same"; }
    return "added";
  });
  // moved: common tokens that are not part of the longest in-order run (LCS of the shared tokens).
  const idxB = b.map((t, i) => i).filter((i) => status[i] === "same");
  const seqA = a.filter((t) => b.includes(t));
  const seqB = idxB.map((i) => b[i]);
  const n = seqA.length, m = seqB.length;
  const L: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) L[i][j] = seqA[i] === seqB[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const keep = new Set<number>();
  for (let i = 0, j = 0; i < n && j < m;) {
    if (seqA[i] === seqB[j]) { keep.add(j); i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++;
  }
  idxB.forEach((bi, j) => { if (!keep.has(j)) status[bi] = "moved"; });
  return status;
}

/** Before → after, with what changed highlighted in the after line. */
export function Transformation({
  from, to, fromState, toState, label, showRoles = false, size = "md",
}: {
  from: SentencePart[]; to: SentencePart[]; fromState?: SentenceState; toState?: SentenceState;
  label?: ReactNode; showRoles?: boolean; size?: keyof typeof SIZE;
}) {
  const d = diffParts(from, to);
  const fromP = fromState?.mood && fromState.mood !== "statement" ? "?" : ".";
  const toP = toState?.mood && toState.mood !== "statement" ? "?" : ".";
  return (
    <div className="space-y-4">
      <div className={`tl flex flex-wrap items-end gap-x-[0.35em] font-medium leading-none text-muted ${SIZE[size]}`}>
        {from.map((p, i) => <span key={i}>{p.text}{i === from.length - 1 ? fromP : ""}</span>)}
      </div>
      <div className="flex items-center gap-3 text-faint">
        <svg width="14" height="18" viewBox="0 0 14 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 1v15M2 11l5 5 5-5" /></svg>
        {label && <span className="text-[12px] font-medium">{label}</span>}
      </div>
      <div className={`flex flex-wrap items-end gap-x-[0.3em] gap-y-3 ${SIZE[size]}`}>
        {to.map((p, i) => {
          const s = d[i];
          return (
            <span key={i} className="flex flex-col items-center">
              <span
                data-role={p.dimension}
                data-aspect={p.dimension === "verb" ? toState?.aspect : undefined}
                className={`tl font-medium leading-none ${s === "added" ? "rounded-md bg-current/10 px-[0.12em] -mx-[0.12em] animate-pop" : ""} ${s === "moved" ? "underline decoration-dotted decoration-2 underline-offset-[0.2em]" : ""}`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {p.text}{i === to.length - 1 ? <span className="text-foreground">{toP}</span> : null}
              </span>
              {showRoles && (
                <span className="mt-2 whitespace-nowrap font-sans text-[10.5px] font-semibold uppercase tracking-[0.1em] text-faint">
                  {s === "added" ? "new · " : s === "moved" ? "moved · " : ""}{roleLabel(p, toState)}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** Tiny legend, used sparingly. */
export function RoleLegend({ roles }: { roles: { role: RoleKey; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium uppercase tracking-[0.1em]">
      {roles.map((r) => <span key={r.role} data-role={r.role}>{r.label}</span>)}
    </div>
  );
}
