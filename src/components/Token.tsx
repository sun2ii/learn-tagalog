"use client";
import { useState } from "react";
import type { Token, Line } from "@/content/types";
import { ROLE_LABEL } from "@/content/types";

const roleClass: Record<Token["role"], string> = {
  action: "text-action border-action/40 bg-action/10",
  person: "text-person border-person/40 bg-person/10",
  thing: "text-thing border-thing/40 bg-thing/10",
  particle: "text-particle border-particle/40 bg-particle/10",
  question: "text-question border-question/40 bg-question/10",
  describe: "text-describe border-describe/40 bg-describe/10",
  time: "text-time border-time/40 bg-time/10",
};

const langName = { id: "Indonesian", es: "Spanish", en: "English" };

/** A sentence rendered as tappable, color-coded pieces. */
export function ColoredLine({ line, showGloss = true }: { line: Line; showGloss?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 text-xl font-semibold leading-relaxed">
        {line.tokens.map((tk, i) => (
          <button key={i} onClick={() => setOpen(open === i ? null : i)}
            className={`rounded-md border px-1.5 py-0.5 ${roleClass[tk.role]} ${open === i ? "ring-2 ring-current" : ""}`}>
            {tk.t}
          </button>
        ))}
      </div>
      {showGloss && <p className="mt-1 text-muted">{line.gloss}</p>}
      {open !== null && <TokenCard tk={line.tokens[open]} />}
    </div>
  );
}

export function TokenCard({ tk }: { tk: Token }) {
  return (
    <div className={`mt-3 rounded-xl border p-3 text-sm ${roleClass[tk.role]}`}>
      <div className="flex items-baseline justify-between">
        <span className="text-lg font-bold">{tk.t}</span>
        <span className="text-[11px] uppercase tracking-wide opacity-80">{ROLE_LABEL[tk.role]}{tk.root && tk.root !== tk.t ? ` · root: ${tk.root}` : ""}</span>
      </div>
      <p className="mt-1 text-foreground">{tk.m}</p>
      {tk.note && <p className="mt-2 text-foreground/80">{tk.note}</p>}
      {tk.anchor && (
        <p className="mt-2 rounded-md bg-card/70 px-2 py-1 text-foreground/90">
          ⚓ {langName[tk.anchor.lang]}: <b>{tk.anchor.word}</b>{tk.anchor.note ? ` — ${tk.anchor.note}` : " — same word."}
        </p>
      )}
    </div>
  );
}

export function Legend() {
  return (
    <div className="flex flex-wrap gap-1.5 text-[11px]">
      {(Object.keys(ROLE_LABEL) as Token["role"][]).map((r) => (
        <span key={r} className={`rounded-full border px-2 py-0.5 ${roleClass[r]}`}>{ROLE_LABEL[r]}</span>
      ))}
    </div>
  );
}

export { roleClass };
