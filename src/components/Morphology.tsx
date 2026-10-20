"use client";

import type { Token, MorphPart, Morphology } from "@/content/types";
import { MORPH_PATTERNS, getPattern } from "@/content/morphology";

/* Color classes for morphology part types */
const PART_COLORS: Record<MorphPart["type"], string> = {
  root: "bg-amber-500/20 text-amber-200 border-amber-500/40",
  prefix: "bg-sky-500/20 text-sky-200 border-sky-500/40",
  infix: "bg-violet-500/20 text-violet-200 border-violet-500/40",
  suffix: "bg-emerald-500/20 text-emerald-200 border-emerald-500/40",
  redup: "bg-pink-500/20 text-pink-200 border-pink-500/40",
};

const PART_LABELS: Record<MorphPart["type"], string> = {
  root: "root",
  prefix: "prefix",
  infix: "infix",
  suffix: "suffix",
  redup: "redup",
};

/* A single morphological part, showing its text and meaning */
function MorphPartView({ part, isLast }: { part: MorphPart; isLast: boolean }) {
  const pattern = part.pattern ? getPattern(part.pattern) : null;
  const gloss = part.gloss || pattern?.meaning || "";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`rounded-md border px-2 py-1 font-mono text-lg font-semibold ${PART_COLORS[part.type]}`}>
        {part.text}
      </div>
      <div className="flex flex-col items-center text-center">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-faint">
          {PART_LABELS[part.type]}
          {pattern && <span className="ml-1 normal-case opacity-70">({pattern.name})</span>}
        </span>
        {gloss && (
          <span className="max-w-24 text-[11px] leading-tight text-muted">{gloss}</span>
        )}
      </div>
    </div>
  );
}

/* Connecting line between parts */
function Connector() {
  return (
    <div className="flex items-center px-1 text-faint">
      <span className="text-lg">+</span>
    </div>
  );
}

/* Full morphology breakdown for a word */
export function MorphologyView({ morph, word }: { morph: Morphology; word: string }) {
  return (
    <div className="flex flex-col gap-3">
      {/* The full word at top */}
      <div className="text-center">
        <span className="font-mono text-xl font-bold text-foreground">{word}</span>
        {morph.label && (
          <span className="ml-2 text-xs text-muted">({morph.label})</span>
        )}
      </div>

      {/* Decomposition */}
      <div className="flex flex-wrap items-start justify-center gap-1">
        {morph.parts.map((part, i) => (
          <div key={i} className="flex items-start">
            <MorphPartView part={part} isLast={i === morph.parts.length - 1} />
            {i < morph.parts.length - 1 && <Connector />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Compact inline indicator that a word has morphology */
export function MorphIndicator({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-violet-500/30 text-[9px] font-bold text-violet-300 hover:bg-violet-500/50"
      title="View morphology"
    >
      M
    </button>
  );
}

/* Card showing full morphology, used in tooltips or panels */
export function MorphologyCard({ token }: { token: Token }) {
  if (!token.morph) return null;

  return (
    <div className="rounded-lg border border-violet-500/30 bg-card/95 p-4">
      <MorphologyView morph={token.morph} word={token.t} />
    </div>
  );
}

/* Check if a token has morphology worth showing */
export function hasMorphology(token: Token): boolean {
  return !!token.morph && token.morph.parts.length > 1;
}
