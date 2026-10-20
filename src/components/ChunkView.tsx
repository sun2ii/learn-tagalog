"use client";

import { useState } from "react";
import type { Token } from "@/content/types";
import type { Chunk, StoryLine } from "@/content/stories";
import { ROLE_LABEL } from "@/content/types";
import { MorphologyView, hasMorphology } from "./Morphology";

/* Role to visual style mapping */
const ROLE_ATTR: Record<Token["role"], string> = {
  action: "verb",
  person: "actor",
  thing: "object",
  particle: "particle",
  question: "question",
  describe: "describe",
  time: "time",
};

const ASPECT_TAG = {
  contemplated: "not yet",
  ongoing: "ongoing",
  completed: "done",
} as const;

interface ChunkViewProps {
  line: StoryLine;
  onClose: () => void;
}

/* Get the text for a chunk from tokens */
function getChunkText(tokens: Token[], range: [number, number]): string {
  return tokens.slice(range[0], range[1]).map(t => t.t).join(" ");
}

/* A single chunk block */
function ChunkBlock({
  chunk,
  tokens,
  index,
  isExpanded,
  onToggle,
}: {
  chunk: Chunk;
  tokens: Token[];
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const [selectedToken, setSelectedToken] = useState<number | null>(null);
  const chunkTokens = tokens.slice(chunk.range[0], chunk.range[1]);

  return (
    <div className="rounded-xl border border-line bg-card/50 overflow-hidden">
      {/* Chunk header - clickable to expand */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 text-left transition-colors hover:bg-surface/50"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {/* Tagalog chunk */}
            <div className="tl text-lg font-medium leading-snug">
              {chunkTokens.map((t, i) => (
                <span
                  key={i}
                  data-role={ROLE_ATTR[t.role]}
                  data-aspect={t.aspect}
                  className="mr-1"
                >
                  {t.t}
                </span>
              ))}
            </div>
            {/* English gloss */}
            <div className="mt-1 text-sm text-muted">{chunk.gloss}</div>
          </div>
          {/* Expand indicator */}
          <span className="text-faint text-sm">
            {isExpanded ? "−" : "+"}
          </span>
        </div>
      </button>

      {/* Expanded view - shows individual tokens */}
      {isExpanded && (
        <div className="border-t border-line bg-surface/30 px-4 py-3">
          <div className="flex flex-wrap gap-2">
            {chunkTokens.map((t, i) => {
              const globalIndex = chunk.range[0] + i;
              const isSelected = selectedToken === globalIndex;
              const showMorph = hasMorphology(t);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedToken(isSelected ? null : globalIndex)}
                  className={`group relative rounded-lg border px-3 py-2 text-left transition-all ${
                    isSelected
                      ? "border-foreground/40 bg-surface ring-1 ring-foreground/20"
                      : "border-line hover:border-line-strong hover:bg-surface/50"
                  }`}
                >
                  {/* Word */}
                  <div
                    data-role={ROLE_ATTR[t.role]}
                    data-aspect={t.aspect}
                    className="tl text-base font-medium"
                  >
                    {t.t}
                    {showMorph && (
                      <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-violet-500/30 text-[8px] font-bold text-violet-300">
                        M
                      </span>
                    )}
                  </div>
                  {/* Meaning */}
                  <div className="mt-0.5 text-xs text-muted">{t.m}</div>
                  {/* Role label */}
                  <div className="mt-1 text-[9px] font-semibold uppercase tracking-wide text-faint">
                    {ROLE_LABEL[t.role]}
                    {t.aspect && ` · ${ASPECT_TAG[t.aspect]}`}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Morphology panel for selected token */}
          {selectedToken !== null && hasMorphology(tokens[selectedToken]) && (
            <div className="mt-4 rounded-lg border border-violet-500/20 bg-violet-500/5 p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-violet-300">
                Word Structure
              </div>
              <MorphologyView
                morph={tokens[selectedToken].morph!}
                word={tokens[selectedToken].t}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* Full chunk view panel */
export function ChunkView({ line, onClose }: ChunkViewProps) {
  const [expandedChunk, setExpandedChunk] = useState<number | null>(0);

  // If no chunks defined, create a single chunk from all tokens
  const chunks: Chunk[] = line.chunks ?? [
    { range: [0, line.tokens.length], gloss: line.gloss },
  ];

  return (
    <div className="mx-auto mt-4 w-full max-w-3xl animate-rise-fast">
      <div className="rounded-2xl border border-line bg-card p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-faint">
              Sentence Structure
            </div>
            <div className="mt-1 text-sm text-muted">
              {chunks.length} {chunks.length === 1 ? "chunk" : "chunks"} · tap to explore words
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-surface hover:text-foreground"
          >
            Close
          </button>
        </div>

        {/* Full sentence at top */}
        <div className="mb-4 rounded-lg bg-surface/50 px-4 py-3">
          <div className="tl text-lg font-medium leading-snug">{line.text}</div>
          <div className="mt-1 text-sm text-muted">{line.gloss}</div>
        </div>

        {/* Chunks */}
        <div className="space-y-2">
          {chunks.map((chunk, i) => (
            <ChunkBlock
              key={i}
              chunk={chunk}
              tokens={line.tokens}
              index={i}
              isExpanded={expandedChunk === i}
              onToggle={() => setExpandedChunk(expandedChunk === i ? null : i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* Simple chunk indicator showing sentence can be broken down */
export function ChunkIndicator({ count }: { count: number }) {
  return (
    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[10px] font-medium text-muted">
      <span className="text-foreground">{count}</span> chunks
    </span>
  );
}
