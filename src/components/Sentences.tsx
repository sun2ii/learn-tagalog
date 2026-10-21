"use client";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  CONNECTORS, JOURNEYS, journeyById,
  type Context, type CreateEx, type Journey, type PracticeMode, type RecombineEx, type SubstituteEx, type Target, type Vocab,
} from "@/content/sentences";
import {
  composePassage, evaluate, normalize, passageAccepted, passageContext, readProgress, segment, segmentIndonesian, writeProgress,
  type Correction, type Evaluation, type JourneyProgress, type Op,
} from "@/lib/sentences";
import { recordRepToday } from "@/lib/today";
import { Button, Eyebrow, Kbd } from "./ui";

/* ------------------------------------------------------------------
   SENTENCES. Four journeys; each is one passage built from clauses.
   All clauses are on one page: translate every one, then check them
   together. The checked passage appears whole, with its connectors.
   Then one final challenge: the whole passage from Indonesian, no help.
   ------------------------------------------------------------------ */

type Screen = { kind: "home" } | { kind: "journey"; id: string; seed: number };

export function Sentences() {
  // Rendered client-only (see app/sentences/page.tsx), so progress can be read at first render.
  const [progress, setProgress] = useState<JourneyProgress>(() => readProgress());
  const [screen, setScreen] = useState<Screen>({ kind: "home" });
  useEffect(() => { writeProgress(progress); }, [progress]);

  const home = useCallback(() => setScreen({ kind: "home" }), []);
  const start = useCallback((id: string) => setScreen({ kind: "journey", id, seed: Date.now() }), []);

  useEffect(() => {
    if (screen.kind !== "home") return;
    const h = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      const n = Number(e.key);
      if (n >= 1 && n <= JOURNEYS.length) { e.preventDefault(); start(JOURNEYS[n - 1].id); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [screen.kind, start]);

  if (screen.kind === "journey") {
    const journey = journeyById(screen.id);
    if (!journey) { home(); return null; }
    return (
      <JourneyView key={screen.seed} journey={journey} onExit={home} practiced={progress.practiced[journey.id] ?? []}
        onComplete={() => setProgress((p) => ({ ...p, done: [...new Set([...p.done, journey.id])] }))}
        onPractice={(mode) => setProgress((p) => ({ ...p, practiced: { ...p.practiced, [journey.id]: [...new Set([...(p.practiced[journey.id] ?? []), mode])] } }))} />
    );
  }

  return (
    <div className="animate-rise">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Sentences</Eyebrow>
          <h1 className="mt-1.5 text-[28px] font-semibold leading-none tracking-tight">Connect your thoughts.</h1>
          <p className="mt-2 max-w-xl text-[14.5px] text-muted">Each journey builds one sentence. Translate every clause, then check them together.</p>
        </div>
        <button onClick={() => setProgress({ done: [], practiced: {} })} className="text-[12.5px] text-muted hover:text-foreground">Reset</button>
      </header>

      <ul className="mt-8 divide-y divide-line border-y border-line">
        {JOURNEYS.map((j, i) => (
          <li key={j.id}>
            <button type="button" onClick={() => start(j.id)} className="group flex w-full items-center gap-6 py-5 text-left">
              <span className="w-6 text-[26px] font-medium leading-none text-faint">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[19px] font-semibold tracking-tight">{j.title}</span>
                <span className="block text-[14px] text-muted">{j.blurb}</span>
                <span className="tl mt-1 block text-[14.5px] text-faint">{j.grammar.map((k) => CONNECTORS[k]?.word).filter(Boolean).join(" · ")}</span>
              </span>
              <span className="shrink-0 text-[12.5px] tabular-nums text-faint">{progress.done.includes(j.id) ? "done" : `${j.steps.length} clauses`} <Kbd>{i + 1}</Kbd></span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- One journey: every clause on one page ---------------- */

type Phase = "steps" | "challenge" | PracticeMode;

const MODES: { mode: PracticeMode; label: string; what: string }[] = [
  { mode: "substitute", label: "Substitute", what: "Same grammar, new words." },
  { mode: "recombine", label: "Recombine", what: "A new situation. You pick the connectors." },
  { mode: "create", label: "Create", what: "Describe a situation in your own sentence." },
];

function JourneyView({ journey, onExit, onComplete, onPractice, practiced }: {
  journey: Journey; onExit: () => void; onComplete: () => void; onPractice: (mode: PracticeMode) => void; practiced: PracticeMode[];
}) {
  const steps = journey.steps;
  const [answers, setAnswers] = useState<string[]>(() => steps.map(() => ""));
  const [results, setResults] = useState<(Evaluation | null)[]>(() => steps.map(() => null));
  const [phase, setPhase] = useState<Phase>("steps");
  const [open, setOpen] = useState<string | null>(null);
  const refs = useRef<(HTMLTextAreaElement | null)[]>([]);

  const passage = useMemo(() => composePassage(steps), [steps]);
  const indonesian = useMemo(() => composePassage(steps, steps.length, "indonesian"), [steps]);
  const learned = useMemo(() => [...new Set(steps.flatMap((s) => s.connectors))], [steps]);
  const allChecked = results.every(Boolean);
  const pending = answers.some((a, i) => a.trim() && !results[i]);

  useEffect(() => { refs.current[0]?.focus(); }, []);

  const focusNextOpen = useCallback((from: number, rs: (Evaluation | null)[]) => {
    const after = steps.findIndex((_, k) => k > from && !rs[k]);
    const next = after >= 0 ? after : steps.findIndex((_, k) => !rs[k]);
    if (next >= 0) setTimeout(() => refs.current[next]?.focus(), 0);
  }, [steps]);

  /** Check one clause; focus moves to the next unchecked one. */
  const checkRow = useCallback((i: number) => {
    if (!answers[i].trim() || results[i]) return;
    const r = evaluate(answers[i], steps[i], steps[i]);
    recordRepToday(r.verdict === "correct", 0);
    const rs = results.map((x, k) => (k === i ? r : x));
    setResults(rs);
    focusNextOpen(i, rs);
  }, [answers, results, steps, focusNextOpen]);

  /** Check every clause that has text and is not checked yet. */
  const checkAll = useCallback(() => {
    const rs = results.map((x, i) => {
      if (x || !answers[i].trim()) return x;
      const r = evaluate(answers[i], steps[i], steps[i]);
      recordRepToday(r.verdict === "correct", 0);
      return r;
    });
    setResults(rs);
    focusNextOpen(-1, rs);
  }, [answers, results, steps, focusNextOpen]);

  /** Reopen one clause, text kept. */
  const retryRow = useCallback((i: number) => {
    setResults((rs) => rs.map((x, k) => (k === i ? null : x)));
    setOpen(null);
    setTimeout(() => refs.current[i]?.focus(), 0);
  }, []);

  /** Reopen every clause, text kept. */
  const retryAll = useCallback(() => {
    setResults(steps.map(() => null)); setOpen(null);
    setTimeout(() => refs.current[0]?.focus(), 0);
  }, [steps]);

  // Escape leaves. Once every clause is checked: Enter goes on to the challenge, Backspace reopens them all.
  useEffect(() => {
    const armedAt = performance.now();
    const h = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA");
      if (e.key === "Escape" && !typing) { if (phase === "steps") onExit(); else setPhase("steps"); return; }
      if (phase !== "steps" || !allChecked || typing || e.timeStamp <= armedAt) return;
      if (t && (t.tagName === "BUTTON" || t.tagName === "A")) return;
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); setPhase("challenge"); }
      else if (e.key === "Backspace") { e.preventDefault(); retryAll(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [phase, allChecked, onExit, retryAll]);

  const onKey = (i: number) => (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") { e.currentTarget.blur(); return; }
    if (e.key !== "Enter" || e.shiftKey) return;
    e.preventDefault(); e.stopPropagation();
    if (answers[i].trim()) checkRow(i);
    else refs.current[(i + 1) % steps.length]?.focus();
  };

  const setAnswer = (i: number, v: string) => setAnswers((a) => a.map((x, k) => (k === i ? v : x)));
  const checked = results.filter(Boolean).length;
  const correct = results.filter((r) => r?.verdict === "correct").length;

  return (
    <div className="animate-rise">
      <div className="flex items-center justify-between text-[13px]">
        <button onClick={onExit} className="text-muted hover:text-foreground">← Journeys</button>
        <span className="tabular-nums text-muted">
          {phase === "challenge" ? "Final challenge" : phase !== "steps" ? MODES.find((m) => m.mode === phase)?.label : checked ? `${correct} of ${steps.length} correct` : `${steps.length} clauses`}
        </span>
      </div>

      <section className="mx-auto mt-8 max-w-xl">
        <Eyebrow>{journey.title}</Eyebrow>
        {phase === "steps" && !allChecked && <p className="mt-2 text-[14.5px] text-muted">{journey.blurb} Each clause adds one idea to the same sentence.</p>}

        {/* The whole sentence, once every clause is checked. Hidden during the challenge, since it is the answer. */}
        {phase === "steps" && allChecked && (
          <div className="mt-3 animate-rise-fast">
            <SentenceText tagalog={passage} connectors={learned} open={open} onPick={(k) => setOpen((o) => (o === k ? null : k))} />
            <p className="mt-3 text-[15px] leading-relaxed text-muted">{indonesian}</p>
            {open && CONNECTORS[open] && <ConnectorNote k={open} />}
            <Eyebrow className="mt-7">Grammar learned</Eyebrow>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-[14px]">
              {journey.grammar.map((k) => <ConnectorRow key={k} k={k} />)}
            </dl>
          </div>
        )}

        {phase === "steps" && (
          <div className={`${allChecked ? "mt-8 border-t border-line pt-6" : "mt-6"}`}>
            <ol className="space-y-7">
              {steps.map((s, i) => {
                const r = results[i];
                return (
                  <li key={i} className="grid grid-cols-[1.5rem_1fr] gap-x-3">
                    <span className="pt-1 text-[15px] tabular-nums text-faint">{i + 1}</span>
                    <div>
                      {r ? <p className="text-[18px] leading-relaxed text-muted">{s.indonesian}</p> : <PromptText text={s.indonesian} vocab={vocabFor(s)} />}
                      <textarea ref={(el) => { refs.current[i] = el; }} value={answers[i]} onChange={(e) => setAnswer(i, e.target.value)} onKeyDown={onKey(i)}
                        onInput={autosize} disabled={!!r} rows={1} spellCheck={false} autoCapitalize="off" autoCorrect="off" placeholder="…" style={{ outline: "none" }}
                        className="tl mt-2 w-full resize-none overflow-hidden border-0 border-b border-line-strong bg-transparent pb-1.5 text-[22px] leading-snug text-foreground placeholder:text-faint focus:border-foreground disabled:opacity-60" />
                      {r && (
                        <div className="mt-2 animate-rise-fast">
                          <div className="flex items-baseline justify-between gap-4">
                            <span className={`text-[13px] font-semibold ${r.verdict === "correct" ? "text-ok" : r.verdict === "almost" ? "text-foreground" : "text-err"}`}>
                              {r.verdict === "correct" ? "Correct" : r.verdict === "almost" ? "Almost" : "Needs review"}
                            </span>
                            <button type="button" onClick={() => retryRow(i)} className="text-[12.5px] text-faint hover:text-foreground">Try again</button>
                          </div>
                          {r.verdict !== "correct" && <Reference text={r.reference} ops={r.ops} corrections={r.corrections} size="sm" />}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            {!allChecked && (
              <div className="mt-8 flex items-center justify-between gap-5 text-[12px] text-faint">
                <span className="hidden md:inline">↵ check this clause · ⇧↵ new line · tap a word for its Tagalog</span>
                <Button variant="primary" size="sm" className="ml-auto" onClick={checkAll} disabled={!pending}>Check all</Button>
              </div>
            )}
            {allChecked && (
              <div className="mt-8 flex flex-wrap items-center gap-5 text-[13px]">
                <button type="button" onClick={retryAll} className="text-muted hover:text-foreground">Try all again <Kbd>⌫</Kbd></button>
                <button type="button" onClick={() => { onComplete(); onExit(); }} className="text-muted hover:text-foreground">Skip</button>
                <Button variant="primary" size="sm" className="ml-auto" onClick={() => setPhase("challenge")}>Final challenge → <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">↵</Kbd></Button>
              </div>
            )}

            {/* Practice deeper: BUILD is done; SUBSTITUTE, RECOMBINE and CREATE use its grammar in new situations. */}
            {allChecked && (
              <div className="mt-10 border-t border-line pt-7">
                <Eyebrow>Practice deeper</Eyebrow>
                <p className="mt-2 text-[14.5px] text-muted">You&rsquo;ve built the sentence. Now use its grammar in new situations.</p>
                <ul className="mt-4 divide-y divide-line border-y border-line">
                  {MODES.map((m) => {
                    const n = journey[m.mode].length;
                    if (!n) return null;
                    return (
                      <li key={m.mode}>
                        <button type="button" onClick={() => setPhase(m.mode)} className="group flex w-full items-center gap-5 py-3.5 text-left">
                          <span className="min-w-0 flex-1">
                            <span className="block text-[16px] font-semibold tracking-tight">{m.label}</span>
                            <span className="block text-[13.5px] text-muted">{m.what}</span>
                          </span>
                          <span className="shrink-0 text-[12.5px] tabular-nums text-faint">{practiced.includes(m.mode) ? "done" : n}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        )}

        {phase === "challenge" && (
          <div className="mt-8 border-t border-line pt-7">
            <Translate prompt={indonesian} target={{ tagalog: passage, acceptedAnswers: passageAccepted(steps).slice(1) }}
              ctx={passageContext(steps)} rows={4} continueLabel="Back to journey" onContinue={() => { onComplete(); setPhase("steps"); }} />
          </div>
        )}

        {phase === "substitute" && <SubstituteMode items={journey.substitute} onBack={() => setPhase("steps")} onFinish={() => { onPractice("substitute"); setPhase("steps"); }} />}
        {phase === "recombine" && <RecombineMode items={journey.recombine} onBack={() => setPhase("steps")} onFinish={() => { onPractice("recombine"); setPhase("steps"); }} />}
        {phase === "create" && <CreateMode items={journey.create} onBack={() => setPhase("steps")} onFinish={() => { onPractice("create"); setPhase("steps"); }} />}
      </section>
    </div>
  );
}

/** Connectors first, then the clause's own words: what a tapped Indonesian word can reveal. */
function vocabFor(ctx: Context): Vocab[] {
  const seen = new Set<string>();
  return [
    ...ctx.connectors.map((k) => CONNECTORS[k]).filter(Boolean).map((c) => ({ tagalog: c.word, indonesian: c.meaning })),
    ...ctx.vocabulary,
  ].filter((v) => (seen.has(v.tagalog) ? false : (seen.add(v.tagalog), true)));
}

/** Grow a textarea with its content. */
function autosize(e: React.FormEvent<HTMLTextAreaElement>) {
  const el = e.currentTarget;
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

/* ---------------- The final challenge: the whole sentence ---------------- */

function Translate({ prompt, eyebrow = "The whole sentence, from Indonesian", target, ctx, rows = 2, help = true, explain, continueLabel, onContinue }: {
  prompt: string; eyebrow?: string; target: Target; ctx: Context; rows?: number;
  help?: boolean;              // tap a word in the prompt for its Tagalog. Off for Recombine, where choosing the connector is the exercise
  explain?: ReactNode;         // shown under the reference after checking
  continueLabel: string; onContinue: () => void;
}) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Evaluation | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  const vocab = useMemo(() => vocabFor(ctx), [ctx]);

  useEffect(() => { if (!result) ref.current?.focus(); }, [result]);

  const check = useCallback(() => {
    if (!value.trim() || result) return;
    const r = evaluate(value, target, ctx);
    setResult(r);
    recordRepToday(r.verdict === "correct", 0);
  }, [value, result, target, ctx]);

  /** Keep what was typed so it can be edited rather than retyped. */
  const retry = useCallback(() => setResult(null), []);

  // After checking: Enter continues, Backspace retries. Ignore the keydown that did the checking: it is still bubbling.
  useEffect(() => {
    if (!result) return;
    const armedAt = performance.now();
    const h = (e: KeyboardEvent) => {
      if (e.timeStamp <= armedAt || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onContinue(); }
      else if (e.key === "Backspace" && result.verdict !== "correct") { e.preventDefault(); retry(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [result, onContinue, retry]);

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") { e.currentTarget.blur(); return; }
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); e.stopPropagation(); check(); }
  };

  const tone = result?.verdict === "correct" ? "text-ok" : result?.verdict === "almost" ? "text-foreground" : "text-err";
  const label = result?.verdict === "correct" ? "Correct" : result?.verdict === "almost" ? "Almost correct" : "Different from reference";

  return (
    <div>
      <Eyebrow>{eyebrow}</Eyebrow>
      {help ? <div className="mt-2"><PromptText text={prompt} vocab={vocab} /></div> : <p className="mt-2 text-[18px] leading-relaxed text-foreground">{prompt}</p>}

      <textarea ref={ref} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={onKey} disabled={!!result}
        rows={rows} spellCheck={false} autoCapitalize="off" autoCorrect="off" placeholder="Type in Tagalog…" style={{ outline: "none" }}
        className="tl mt-6 w-full resize-none border-0 border-b border-line-strong bg-transparent pb-2 text-[24px] leading-snug text-foreground placeholder:text-faint focus:border-foreground disabled:opacity-60" />
      {!result && <div className="mt-1.5 hidden text-[11.5px] text-faint md:block">↵ check · ⇧↵ new line{help ? " · tap a word for its Tagalog" : ""}</div>}

      {!result && (
        <div className="mt-6 flex items-center">
          <Button variant="primary" size="sm" className="ml-auto" onClick={check} disabled={!value.trim()}>Check</Button>
        </div>
      )}

      {result && (
        <div className="mt-6 animate-rise-fast">
          <div className={`text-[15px] font-semibold ${tone}`}>{label}</div>
          <Reference text={result.reference} ops={result.ops} corrections={result.corrections} />
          {result.verdict === "review" && result.corrections.length === 0 && (
            <p className="mt-2 text-[13px] text-faint">Quite different from the reference. It may still be a valid way to say it.</p>
          )}
          {explain}
          <div className="mt-7 flex flex-wrap items-center gap-5 text-[13px]">
            {result.verdict !== "correct" && <button type="button" onClick={retry} className="text-muted hover:text-foreground">Try again <Kbd>⌫</Kbd></button>}
            <Button variant="primary" size="sm" className="ml-auto" onClick={onContinue}>{continueLabel} → <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">↵</Kbd></Button>
          </div>
        </div>
      )}
    </div>
  );
}

/** The reference sentence with the words the learner missed or got wrong marked. Tap one for its note. */
function Reference({ text, ops, corrections, size = "md" }: { text: string; ops: Op[]; corrections: Correction[]; size?: "sm" | "md" }) {
  const [open, setOpen] = useState<number | null>(null);
  const words = text.split(/\s+/).filter(Boolean);
  const refOps = ops.filter((o) => o.kind !== "extra"); // one per reference word, in order
  const aligned = refOps.length === words.length;
  const noteFor = (w: string) => corrections.find((c) => c.to && c.to.split(" ").includes(normalize(w)))?.explain;
  return (
    <div className={size === "sm" ? "mt-1" : "mt-3"}>
      <div className={`tl leading-snug text-foreground ${size === "sm" ? "text-[20px]" : "text-[24px]"}`}>
        {words.map((w, i) => {
          const wrong = aligned && refOps[i].kind !== "keep";
          const space = i < words.length - 1 ? " " : "";
          if (!wrong) return <span key={i}>{w}{space}</span>;
          return (
            <span key={i}>
              <button type="button" onClick={() => setOpen((o) => (o === i ? null : i))}
                className={`rounded-sm text-err underline decoration-1 underline-offset-[6px] ${open === i ? "decoration-err" : "decoration-err/50 hover:decoration-err"}`}>{w}</button>
              {space}
            </span>
          );
        })}
      </div>
      {open !== null && noteFor(words[open]) && <div className="mt-2 text-[13.5px] text-muted animate-fade">{noteFor(words[open])}</div>}
    </div>
  );
}

/** The Indonesian prompt. Tap a word to see its Tagalog beneath it; tap again to hide. */
function PromptText({ text, vocab }: { text: string; vocab: Vocab[] }) {
  // Consecutive words that share one vocab entry ("akan mampir") form a group and open together.
  const groups = useMemo(() => {
    const segs = segmentIndonesian(text, vocab);
    const out: { segs: typeof segs; vocab?: Vocab }[] = [];
    for (const s of segs) {
      const last = out[out.length - 1];
      if (s.vocab && last && last.vocab === s.vocab && !last.segs[last.segs.length - 1].trailing) last.segs.push(s);
      else out.push({ segs: [s], vocab: s.vocab });
    }
    return out;
  }, [text, vocab]);
  const [open, setOpen] = useState<Set<number>>(new Set());
  const toggle = (i: number) => setOpen((o) => { const n = new Set(o); if (n.has(i)) n.delete(i); else n.add(i); return n; });
  return (
    <p className="text-[18px] leading-[1.9] text-foreground">
      {groups.map((g, i) => {
        const text = g.segs.map((s) => s.text).join(" ");
        const trailing = g.segs[g.segs.length - 1].trailing;
        const space = i < groups.length - 1 ? " " : "";
        if (!g.vocab) return <span key={i}>{text}{trailing}{space}</span>;
        const isOpen = open.has(i);
        return (
          <span key={i}>
            <span className="inline-flex flex-col items-start">
              <button type="button" onClick={() => toggle(i)}
                className={`rounded-sm underline decoration-1 underline-offset-[5px] transition-colors ${isOpen ? "decoration-foreground" : "decoration-line-strong hover:decoration-foreground/60"}`}>
                {text}
              </button>
              {isOpen && <span className="tl -mt-1 text-[15px] leading-tight text-muted animate-fade">{g.vocab.tagalog}</span>}
            </span>
            {trailing}{space}
          </span>
        );
      })}
    </p>
  );
}

/* ---------------- Practice deeper ---------------- */

/** Walks a list of exercises: "n of N", back link, and the finish call after the last one. */
function useSequence(count: number, onFinish: () => void) {
  const [i, setI] = useState(0);
  const next = useCallback(() => { if (i + 1 >= count) onFinish(); else setI(i + 1); }, [i, count, onFinish]);
  return { i, next, last: i + 1 >= count };
}

function ModeHeader({ label, i, count, onBack }: { label: string; i: number; count: number; onBack: () => void }) {
  return (
    <div className="mt-3 flex items-center justify-between text-[13px]">
      <button type="button" onClick={onBack} className="text-muted hover:text-foreground">← Back to journey</button>
      <span className="tabular-nums text-muted">{label} · {i + 1} of {count}</span>
    </div>
  );
}

/** SUBSTITUTE: the journey's clause beside a new sentence in the same frame. */
function SubstituteMode({ items, onBack, onFinish }: { items: SubstituteEx[]; onBack: () => void; onFinish: () => void }) {
  const { i, next, last } = useSequence(items.length, onFinish);
  const ex = items[i];
  return (
    <div className="animate-rise-fast">
      <ModeHeader label="Substitute" i={i} count={items.length} onBack={onBack} />
      <div className="mt-6">
        <Eyebrow>From the journey</Eyebrow>
        <div className="tl mt-1.5 text-[20px] leading-snug text-muted">{ex.original.tagalog}</div>
        <p className="mt-0.5 text-[13.5px] text-faint">{ex.original.indonesian}</p>
        <div className="mt-2 font-mono text-[12px] tracking-tight text-faint">{ex.grammarFocus}</div>
      </div>
      <div key={i} className="mt-7 border-t border-line pt-6">
        <Translate eyebrow="Same frame, new words" prompt={ex.indonesian} target={ex} ctx={ex} rows={2}
          explain={<p className="mt-4 text-[14px] leading-relaxed text-muted">{ex.explanation}</p>}
          continueLabel={last ? "Back to journey" : "Next"} onContinue={next} />
      </div>
    </div>
  );
}

/** RECOMBINE: a new situation; the connectors are the exercise, so no help before the answer. */
function RecombineMode({ items, onBack, onFinish }: { items: RecombineEx[]; onBack: () => void; onFinish: () => void }) {
  const { i, next, last } = useSequence(items.length, onFinish);
  const ex = items[i];
  return (
    <div className="animate-rise-fast">
      <ModeHeader label="Recombine" i={i} count={items.length} onBack={onBack} />
      <p className="mt-6 text-[14.5px] text-muted">Choose the connectors yourself. {ex.connectors.length} relations to join.</p>
      <div key={i} className="mt-5 border-t border-line pt-6">
        <Translate eyebrow="Translate into Tagalog" prompt={ex.indonesian} target={ex} ctx={ex} rows={3} help={false}
          explain={
            <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 border-l-2 border-line pl-4 text-[14px]">
              {ex.explanation.map((e) => (
                <ConnectorExplain key={e.connector} k={e.connector} note={e.note} />
              ))}
            </dl>
          }
          continueLabel={last ? "Back to journey" : "Next"} onContinue={next} />
      </div>
    </div>
  );
}

function ConnectorExplain({ k, note }: { k: string; note: string }) {
  const c = CONNECTORS[k];
  if (!c) return null;
  return (
    <>
      <dt className="tl self-start pt-0.5 text-[17px] text-foreground">{c.word}</dt>
      <dd className="text-muted"><span className="text-faint">{c.meaning} · </span>{note}</dd>
    </>
  );
}

/** CREATE: a situation, a free answer, then one natural example to compare against. Nothing is judged. */
function CreateMode({ items, onBack, onFinish }: { items: CreateEx[]; onBack: () => void; onFinish: () => void }) {
  const { i, next, last } = useSequence(items.length, onFinish);
  const ex = items[i];
  return (
    <div className="animate-rise-fast">
      <ModeHeader label="Create" i={i} count={items.length} onBack={onBack} />
      <CreateOne key={i} ex={ex} continueLabel={last ? "Back to journey" : "Next"} onContinue={next} />
    </div>
  );
}

function CreateOne({ ex, continueLabel, onContinue }: { ex: CreateEx; continueLabel: string; onContinue: () => void }) {
  const [value, setValue] = useState("");
  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { if (!shown) ref.current?.focus(); }, [shown]);

  // After the example is shown: Enter continues, Backspace goes back to writing.
  useEffect(() => {
    if (!shown) return;
    const armedAt = performance.now();
    const h = (e: KeyboardEvent) => {
      if (e.timeStamp <= armedAt || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "BUTTON" || t.tagName === "A")) return;
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onContinue(); }
      else if (e.key === "Backspace") { e.preventDefault(); setShown(false); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [shown, onContinue]);

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") { e.currentTarget.blur(); return; }
    if (e.key === "Enter" && !e.shiftKey && value.trim()) { e.preventDefault(); e.stopPropagation(); setShown(true); }
  };

  return (
    <div className="mt-6">
      <Eyebrow>The situation</Eyebrow>
      <ul className="mt-2 space-y-0.5 text-[17px] leading-relaxed text-foreground">
        {ex.situation.map((s, k) => <li key={k}>{s}</li>)}
      </ul>
      <p className="mt-3 text-[15px] text-muted">{ex.task}</p>

      <textarea ref={ref} value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={onKey} disabled={shown}
        rows={3} spellCheck={false} autoCapitalize="off" autoCorrect="off" placeholder="Write it in Tagalog…" style={{ outline: "none" }}
        className="tl mt-6 w-full resize-none border-0 border-b border-line-strong bg-transparent pb-2 text-[24px] leading-snug text-foreground placeholder:text-faint focus:border-foreground disabled:opacity-60" />
      {!shown && <div className="mt-1.5 hidden text-[11.5px] text-faint md:block">↵ show an example · ⇧↵ new line · there is no single right answer</div>}

      {!shown && (
        <div className="mt-6 flex items-center">
          <Button variant="primary" size="sm" className="ml-auto" onClick={() => setShown(true)} disabled={!value.trim()}>Show example</Button>
        </div>
      )}

      {shown && (
        <div className="mt-6 animate-rise-fast">
          <Eyebrow>One way to say it</Eyebrow>
          <div className="mt-2">
            <SentenceText tagalog={ex.exampleAnswer} connectors={ex.connectors} open={open} onPick={(k) => setOpen((o) => (o === k ? null : k))} size="sm" />
          </div>
          <p className="mt-2 text-[14px] text-muted">{ex.exampleIndonesian}</p>
          {open && CONNECTORS[open] && <ConnectorNote k={open} />}
          <p className="mt-4 text-[14px] leading-relaxed text-muted">{ex.explanation}</p>
          <p className="mt-2 text-[12.5px] text-faint">Compare the joints, not the words. Yours is not checked.</p>
          <div className="mt-7 flex flex-wrap items-center gap-5 text-[13px]">
            <button type="button" onClick={() => setShown(false)} className="text-muted hover:text-foreground">Edit mine <Kbd>⌫</Kbd></button>
            <Button variant="primary" size="sm" className="ml-auto" onClick={onContinue}>{continueLabel} → <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">↵</Kbd></Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Shared pieces ---------------- */

/** Tagalog text, large serif, with the listed connectors tappable. */
function SentenceText({ tagalog, connectors, open, onPick, size = "md" }: { tagalog: string; connectors: string[]; open: string | null; onPick: (k: string) => void; size?: "sm" | "md" }) {
  const segs = useMemo(() => segment(tagalog, connectors), [tagalog, connectors]);
  return (
    <div className={`tl leading-snug text-foreground ${size === "sm" ? "text-[22px]" : "text-[26px] md:text-[30px]"}`}>
      {segs.map((s, i) => (
        <span key={i}>
          {s.connector ? (
            <button type="button" onClick={() => onPick(s.connector!)}
              className={`rounded-sm underline decoration-1 underline-offset-[6px] transition-colors ${open === s.connector ? "decoration-foreground" : "decoration-line-strong hover:decoration-foreground/60"}`}>
              {s.text}
            </button>
          ) : s.text}
          {s.trailing}{i < segs.length - 1 ? " " : ""}
        </span>
      ))}
    </div>
  );
}

function ConnectorRow({ k }: { k: string }) {
  const c = CONNECTORS[k];
  if (!c) return null;
  return (
    <>
      <dt className="tl text-[17px] text-foreground">{cap(c.word)}</dt>
      <dd className="self-center text-muted">= {c.meaning}</dd>
    </>
  );
}

/** Inline disclosure for one connector: word, meaning, function, pattern, example. */
function ConnectorNote({ k }: { k: string }) {
  const c = CONNECTORS[k];
  return (
    <div className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-2 border-l-2 border-line pl-4 text-[14px] animate-fade">
      <Eyebrow className="self-center">{c.word}</Eyebrow><div className="text-foreground">{c.meaning}</div>
      <Eyebrow className="self-center">Function</Eyebrow><div className="text-muted">{c.function}</div>
      <Eyebrow className="self-center">Pattern</Eyebrow><div className="font-mono text-[12.5px] tracking-tight text-muted">{c.pattern}</div>
      <Eyebrow className="self-start pt-1">Example</Eyebrow>
      <div><div className="tl text-[18px] text-foreground">{c.example}</div><div className="text-muted">{c.exampleTranslation}</div></div>
    </div>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
