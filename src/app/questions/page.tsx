"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { render } from "@/languages/tagalog/renderer";
import { NOUNS, getNounsForVerb } from "@/languages/tagalog/nouns";
import { VERBS } from "@/languages/tagalog/verbs";
import { englishFor } from "@/lib/english";
import type { QuestionWord, SentenceState } from "@/engine/types";
import { Anatomy, Transformation } from "@/components/Sentence";
import { EnterToStart, Eyebrow, Kbd, LinkButton } from "@/components/ui";
import { getLearnerState } from "@/lib/learner";
import type { LearnerState } from "@/curriculum/types";

/* The transformation ladder: one sentence, every move Tagalog can make on it. */

type Move = { id: string; label: string; hint: string; apply: (s: SentenceState) => SentenceState };

const MOVES: Move[] = [
  { id: "neg", label: "Hindi", hint: "negate", apply: (s) => ({ ...s, polarity: "negative" }) },
  { id: "ba", label: "ba?", hint: "yes / no", apply: (s) => ({ ...s, mood: "yes_no" }) },
  { id: "negba", label: "Hindi … ba?", hint: "negative question", apply: (s) => ({ ...s, polarity: "negative", mood: "yes_no" }) },
  ...(["bakit", "kailan", "saan", "paano", "ano", "sino"] as QuestionWord[]).map<Move>((q) => ({
    id: q, label: q.charAt(0).toUpperCase() + q.slice(1),
    hint: { bakit: "why", kailan: "when", saan: "where", paano: "how", ano: "what", sino: "who" }[q],
    apply: (s) => ({ ...s, mood: "wh_question", questionWord: q }),
  })),
];

const ACTORS = [["ako", "I"], ["ikaw", "you"], ["siya", "he / she"], ["tayo", "we"]] as const;
const ROOTS = ["kain", ...Object.keys(VERBS).filter((r) => r !== "kain" && VERBS[r].transitive && getNounsForVerb(r).length > 0)];
const aspectOptions = (root: string): (readonly [string, string])[] => {
  const v = VERBS[root]?.actorFocus;
  return [["contemplated", `${v?.contemplated ?? ""} · 0`], ["ongoing", `${v?.ongoing ?? ""} · ½`], ["completed", `${v?.completed ?? ""} · 1`]];
};

export default function QuestionsPage() {
  const [state, setState] = useState<LearnerState | null>(null);
  const [actor, setActor] = useState<string>("ikaw");
  const [aspect, setAspect] = useState<string>("completed");
  const [root, setRoot] = useState<string>("kain");
  const [move, setMove] = useState<string | null>("ba");
  useEffect(() => { setState(getLearnerState()); }, []);

  const object = root === "kain" ? ("adobo" in NOUNS ? "adobo" : "mangga") : getNounsForVerb(root)[0];
  const base = useMemo<SentenceState>(() => ({ root, aspect, actor, focus: "actor", object }), [root, actor, aspect, object]);
  const to = useMemo(() => (move ? MOVES.find((m) => m.id === move)!.apply(base) : null), [move, base]);
  const from = render(base);
  const target = to ? render(to) : null;

  const s = state?.modeStats.questions;
  const acc = s && s.totalReps ? Math.round((s.correct / s.totalReps) * 100) : null;

  return (
    <div className="animate-rise">
      <header className="flex items-end justify-between">
        <div>
          <Eyebrow>Questions</Eyebrow>
          <h1 className="mt-2 text-[34px] font-semibold leading-none tracking-tight">Watch the sentence move.</h1>
        </div>
        {s && s.totalReps > 0 && <div className="text-right text-[13px] tabular-nums text-muted">{s.totalReps} reps · {acc}%</div>}
      </header>

      {/* Ladder */}
      <section className="mt-10 rounded-2xl border border-line p-6 md:p-8">
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <Chips label="verb" value={root} onChange={setRoot} options={ROOTS.map((r) => [r, r])} role="root" />
          <Chips label="who" value={actor} onChange={setActor} options={ACTORS.map(([v, l]) => [v, l])} role="actor" />
          <Chips label="aspect" value={aspect} onChange={setAspect} options={aspectOptions(root)} role="verb" />
        </div>

        <div className="mt-8">
          {target && to ? (
            <Transformation from={from.parts} to={target.parts} fromState={base} toState={to} showRoles size="md" label={MOVES.find((m) => m.id === move)!.hint} />
          ) : (
            <Anatomy parts={from.parts} state={base} showRoles size="md" align="left" />
          )}
          <div className="mt-4 text-[14px] text-muted">{englishFor(to ?? base)}</div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-1.5">
          <span className="mr-2 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-faint">move</span>
          <button onClick={() => setMove(null)} className={`rounded-md border px-2.5 py-1 text-[13px] ${move === null ? "border-foreground bg-foreground text-background" : "border-line hover:border-foreground/60"}`}>statement</button>
          {MOVES.map((m) => (
            <button key={m.id} onClick={() => setMove(m.id)} data-role={m.id === "neg" ? "negation" : "question"}
              className={`tl rounded-md border px-2.5 py-1 text-[16px] transition-colors ${move === m.id ? "border-current bg-current/10" : "border-line hover:border-current"}`}>
              {m.label}<span className="ml-1.5 font-sans text-[11px] text-faint">{m.hint}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Practice */}
      <section className="mt-12 flex flex-col gap-5 rounded-2xl border border-line p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <Eyebrow>Practice</Eyebrow>
          <div className="mt-2 text-[22px] font-semibold tracking-tight">Transform on demand</div>
          <div className="mt-1 text-[14px] text-muted">You get a statement and a move. Type the result, then see what shifted.</div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link href="/questions/drill/?kind=yesno&reps=15" className="h-11 rounded-xl border border-line px-4 text-[14px] font-medium leading-[42px] hover:border-foreground/60">Yes / no</Link>
          <Link href="/questions/drill/?kind=wh&reps=15" className="h-11 rounded-xl border border-line px-4 text-[14px] font-medium leading-[42px] hover:border-foreground/60">Question words</Link>
          <LinkButton href="/questions/drill/?kind=mixed&reps=20" variant="primary">Mixed 20 <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">↵</Kbd></LinkButton>
        </div>
      </section>

      {/* The rules, compact */}
      <section className="mt-12 grid gap-x-10 gap-y-6 md:grid-cols-2">
        <Rule title="ba" body="Yes / no questions add ba after the first piece. Nothing else moves: Kumain ka → Kumain ka ba?" role="question" />
        <Rule title="hindi" body="Negation goes first and pulls the actor forward: Kumain ako → Hindi ako kumain." role="negation" />
        <Rule title="bakit · kailan · saan · paano" body="Question word first, then the actor, then the verb: Bakit ka kumain? The particle ba is not needed." role="question" />
        <Rule title="ano · sino" body="These ask about a noun, so they take ang and flip the focus: Ano ang kinain mo? Sino ang kumain?" role="question" />
      </section>
      <EnterToStart href="/questions/drill/?kind=mixed&reps=20" />
    </div>
  );
}

function Chips({ label, value, onChange, options, role }: { label: string; value: string; onChange: (v: string) => void; options: (readonly [string, string])[]; role: string }) {
  const isAspect = role === "verb";
  const isRoot = role === "root";
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="mr-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-faint">{label}</span>
      {options.map(([v, l]) => (
        <button key={v} onClick={() => onChange(v)} data-role={isRoot ? "verb" : value === v || isAspect ? role : undefined} data-aspect={isAspect ? v : undefined}
          className={`rounded-md border px-2.5 py-1 text-[13px] transition-colors ${isAspect || isRoot ? "tl !text-[15px]" : ""} ${value === v ? "border-current bg-current/10 font-medium" : isAspect || isRoot ? "border-line opacity-60 hover:opacity-100" : "border-line text-muted hover:border-foreground/60 hover:text-foreground"}`}>
          {l}
        </button>
      ))}
    </div>
  );
}

function Rule({ title, body, role }: { title: string; body: string; role: string }) {
  return (
    <div className="border-t border-line pt-4">
      <div className="tl text-[20px] font-medium" data-role={role}>{title}</div>
      <p className="mt-1 text-[14px] leading-relaxed text-muted">{body}</p>
    </div>
  );
}
