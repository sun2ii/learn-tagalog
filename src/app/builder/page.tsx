"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EnterToStart, Eyebrow, Kbd, LinkButton } from "@/components/ui";
import { analyze, nounsFor } from "@/lib/analyze";
import { VERBS } from "@/languages/tagalog/verbs";
import { Info } from "@/components/PieceInfo";
import { nextUp, verdicts } from "@/lib/slots";
import { getLearnerState } from "@/lib/learner";
import type { LearnerState } from "@/curriculum/types";
import type { SentencePart } from "@/languages/tagalog/renderer";

type Role = SentencePart["dimension"];
interface Piece { text: string; role: Role; label: string }

/** The roots the builder can work with: every root the renderer knows that takes an object. */
const ROOTS = Object.keys(VERBS).filter((r) => VERBS[r].transitive && VERBS[r].objectFocus);
const ROOT_KEY = "tagalog.builder.root";

/** Aspect of any verb form, for the red shades. */
const ASPECT_OF: Record<string, string> = {};
for (const v of Object.values(VERBS)) {
  for (const [a, f] of Object.entries(v.actorFocus)) ASPECT_OF[f] = a;
  if (v.objectFocus) for (const [a, f] of Object.entries(v.objectFocus)) ASPECT_OF[f] = a;
}

const ORDER = ["contemplated", "ongoing", "completed"] as const;   // not yet → happening → done
function groupsFor(root: string): { label: string; role: Role; pieces: string[] }[] {
  const v = VERBS[root];
  return [
    { label: "not", role: "negation", pieces: ["hindi"] },
    { label: "ask", role: "question", pieces: ["ba", "ano", "sino", "saan", "kailan", "bakit", "paano"] },
    { label: "verb · actor", role: "verb", pieces: ORDER.map((a) => v.actorFocus[a]) },
    { label: "verb · object", role: "verb", pieces: v.objectFocus ? ORDER.map((a) => v.objectFocus![a]) : [] },
    { label: "who · ang", role: "actor", pieces: ["ako", "ka", "siya", "kami", "tayo", "kayo", "sila"] },
    { label: "who · ng", role: "actor", pieces: ["ko", "mo", "niya", "namin", "natin", "ninyo", "nila"] },
    { label: "marker", role: "particle", pieces: ["ng", "ang"] },
    { label: "thing", role: "object", pieces: nounsFor(root).slice(0, 7) },
    { label: "when", role: "time", pieces: ["kahapon", "ngayon", "mamaya", "bukas"] },
  ];
}

export default function BuilderPage() {
  const [state, setState] = useState<LearnerState | null>(null);
  const [line, setLine] = useState<Piece[]>([]);
  const [root, setRoot] = useState("kain");
  useEffect(() => { setState(getLearnerState()); try { const r = localStorage.getItem(ROOT_KEY); if (r && VERBS[r]) setRoot(r); } catch {} }, []);
  const pickRoot = (r: string) => { setRoot(r); setLine([]); try { localStorage.setItem(ROOT_KEY, r); } catch {} };
  const GROUPS = groupsFor(root);
  const s = state?.modeStats.builder;
  const acc = s && s.totalReps ? Math.round((s.correct / s.totalReps) * 100) : null;
  const isQ = line.some((p) => p.role === "question");
  const a = analyze(line);
  const v = verdicts(line, GROUPS.flatMap((g) => g.pieces));
  const nu = nextUp(line);

  return (
    <div className="animate-rise">
      {/* Header + target-build controls in one row: keeps Free build inside one viewport. */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Sentence Builder</Eyebrow>
          <h1 className="mt-1.5 text-[28px] font-semibold leading-none tracking-tight">Assemble the pieces.</h1>
        </div>
        <div className="flex items-center gap-2">
          {s && s.totalReps > 0 && <span className="mr-2 text-[12.5px] tabular-nums text-muted">{s.totalReps} built · {acc}%</span>}
          <span className="mr-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-faint">Build to a target</span>
          <Link href="/builder/play/?level=simple&reps=10" className="h-9 rounded-lg border border-line px-3 text-[13px] font-medium leading-[34px] hover:border-foreground/60">Simple · 10</Link>
          <LinkButton href="/builder/play/?level=full&reps=15" variant="primary" size="sm">Build 15 <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">↵</Kbd></LinkButton>
        </div>
      </header>

      <section className="mt-6">
        <div className="flex items-baseline justify-between">
          <Eyebrow>Free build</Eyebrow>
          {line.length > 0 && <button onClick={() => setLine([])} className="text-[13px] text-muted hover:text-foreground">Clear</button>}
        </div>
        <div className="mt-2 flex min-h-[72px] flex-wrap items-end gap-x-3 gap-y-3 border-b border-line pb-3">
          {line.length === 0 && <div className="text-[14px] text-faint">Tap a piece. Whatever can&rsquo;t come next greys out — hover it to see why.</div>}
          {line.map((p, i) => (
            <button key={i} onClick={() => setLine((l) => l.slice(0, i))} title="Remove from here" className="group relative flex flex-col items-center animate-pop hover:z-30">
              <Info word={p.text} />
              <span data-role={p.role} data-aspect={ASPECT_OF[p.text]} className="tl text-[28px] font-medium leading-none md:text-[34px]">
                {i === 0 ? p.text.charAt(0).toUpperCase() + p.text.slice(1) : p.text}{i === line.length - 1 ? <span className="text-foreground">{isQ ? "?" : "."}</span> : null}
              </span>
              <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-faint">{p.label}</span>
            </button>
          ))}
        </div>

        {/* One quiet line: the sentence is complete (with its meaning), or what may come next. */}
        <div className="mt-2 min-h-[22px] text-[13.5px]" key={line.map((p) => p.text).join(" ")}>
          {line.length > 0 && nu.complete && a.status === "ok" && (
            <span className="animate-fade"><span className="font-semibold text-ok">Natural.</span> <span className="text-muted">{a.notes[0]}</span>{nu.next.length > 0 && <span className="text-faint"> · or add {nu.next.join(" · ")}</span>}</span>
          )}
          {line.length > 0 && !nu.complete && (
            <span className="animate-fade text-muted">Next: {nu.next.join(" · ")}</span>
          )}
        </div>

        <div className="mt-4 space-y-1.5">
          {/* Which verb the two verb rows (and the things) are built from. */}
          <div className="flex flex-wrap items-center gap-1 pb-2">
            <span className="w-24 shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-faint md:w-28">root</span>
            {ROOTS.map((r) => (
              <button key={r} onClick={() => pickRoot(r)} aria-pressed={root === r} title={VERBS[r].meaning} data-role="verb"
                className={`tl rounded-md border px-2 py-0.5 text-[17px] leading-tight transition-colors ${root === r ? "border-current bg-surface" : "border-transparent opacity-50 hover:opacity-100"}`}>{r}</button>
            ))}
            <span className="ml-2 text-[12px] text-faint">{VERBS[root].meaning} · pick a root to change the verb rows</span>
          </div>
          {GROUPS.map((g) => (
            <div key={g.label} className="flex flex-wrap items-center gap-1">
              <span className="w-24 shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-faint md:w-28">{g.label}</span>
              {g.pieces.map((w) => {
                const ok = v[w]?.allowed ?? true;
                return (
                  <button key={w} aria-disabled={!ok}
                    onClick={() => ok && setLine((l) => [...l, { text: w, role: g.role, label: g.label.split(" · ")[0] }])} data-role={ok ? g.role : undefined} data-aspect={ok ? ASPECT_OF[w] : undefined}
                    className={`group relative tl rounded-md border px-2 py-0.5 text-[17px] leading-tight transition-[transform,border-color,opacity] hover:z-30 focus-visible:z-30 ${ok ? "border-line bg-card hover:-translate-y-px hover:border-current active:translate-y-0 active:scale-95" : "cursor-help border-transparent bg-surface/60 text-faint opacity-60"}`}>
                    {w}
                    <Info word={w} reason={ok ? undefined : v[w]?.reason} />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </section>
      <EnterToStart href="/builder/play/?level=full&reps=15" />
    </div>
  );
}
