"use client";
import { PIECE_INFO } from "@/lib/analyze";

/** Hover card: what a piece means and how it behaves. Shows on hover / focus of the parent `.group`. */
export function Info({ word, reason }: { word: string; reason?: string }) {
  const i = PIECE_INFO[word.toLowerCase()];
  if (!i && !reason) return null;
  return (
    <span role="tooltip" className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-60 -translate-x-1/2 rounded-lg border border-line bg-card p-3 text-left font-sans normal-case tracking-normal shadow-[0_8px_30px_-12px_rgba(0,0,0,0.35)] group-hover:block group-focus-visible:block">
      {reason && <span className="block text-[12.5px] font-medium leading-snug text-err">{reason}</span>}
      {i && <span className={`block text-[13px] font-semibold text-foreground ${reason ? "mt-2" : ""}`}>{i.meaning}</span>}
      {i?.note && <span className="mt-1 block text-[12px] leading-snug text-muted">{i.note}</span>}
    </span>
  );
}
