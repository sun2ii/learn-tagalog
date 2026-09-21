"use client";
import { pieces, type Affix } from "@/lib/verbs";

/* A verb form drawn as its pieces: affix · doubled syllable · root. Colors never change:
   affix = purple, doubled syllable = amber, root = plain. */
const KIND_CLASS = { affix: "text-question", double: "text-time", root: "text-foreground" } as const;

export function FormPieces({ root, double, affix, size = "md", real }: { root: string; double: boolean; affix: Affix; size?: "sm" | "md" | "lg"; real?: string }) {
  const ps = pieces(root, double, affix);
  const built = ps.map((p) => p.text).join("");
  const sz = size === "lg" ? "text-[34px]" : size === "sm" ? "text-[18px]" : "text-[24px]";
  return (
    <span className={`tl inline-flex items-baseline font-medium leading-none ${sz}`}>
      {ps.map((p, i) => <span key={i} className={KIND_CLASS[p.kind]}>{p.text}</span>)}
      {real && real.toLowerCase() !== built.toLowerCase() && <span className="ml-2 font-sans text-[11px] text-faint">→ {real}</span>}
    </span>
  );
}

export function PiecesLegend() {
  return (
    <span className="text-[10.5px] font-semibold uppercase tracking-[0.1em]">
      <span className="text-question">affix</span> <span className="text-faint">·</span> <span className="text-time">doubled syllable</span> <span className="text-faint">·</span> <span className="text-foreground">root</span>
    </span>
  );
}
