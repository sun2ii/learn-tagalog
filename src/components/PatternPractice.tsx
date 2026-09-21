"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ASPECTS, type Aspect } from "@/lib/verbs";
import { ASPECT_UI, PATTERNS, ROWS, ROW_LABEL, VOICE_LABEL, getLabRoot, getPattern, labSentence, patternAt, patternForm, patternOf, steps, verbEnglish, type LabRoot, type Pattern, type Voice } from "@/lib/verbLab";
import { RootBrowser } from "./VerbLab";
import { Button, Kbd } from "./ui";
import { recordRepToday } from "@/lib/today";

/* ------------------------------------------------------------------
   PATTERN PRACTICE. Example → predict → answer → sentence → next.
   One question on screen at a time. Grammar stays behind "Why?".
   Screens: patterns (home) · practice (a session) · root (one root's forms).
   ------------------------------------------------------------------ */

const KIND = { affix: "text-question", double: "text-time", root: "text-foreground" } as const;
const LAST_KEY = "tagalog.practice.last";   // { pattern, aspect }
const DONE_KEY = "tagalog.practice.done";   // ["um-actor:completed", …] — cells finished at least once
const COLS: Aspect[] = ["contemplated", "ongoing", "completed"];   // not yet → happening → done, left to right

type Direction = "tl-en" | "en-tl";
type Screen = { kind: "home" } | { kind: "root"; root: LabRoot } | { kind: "practice"; pattern: Pattern; aspect: Aspect; example: LabRoot } | { kind: "roots"; direction: Direction; seed: number };
/** The 36 roots of the map: every root with an actor-voice form, row by row. */
const MAP_ROOTS: LabRoot[] = ROWS.flatMap((row) => patternAt(row, "actor")?.roots ?? []);

export function PatternPractice() {
  const [screen, setScreen] = useState<Screen>({ kind: "home" });
  const [browser, setBrowser] = useState(false);
  const [last, setLast] = useState<{ pattern: Pattern; aspect: Aspect } | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());

  useEffect(() => {
    try { const j = JSON.parse(localStorage.getItem(LAST_KEY) || "null"); const p = getPattern(j?.pattern); if (p && ASPECTS.includes(j.aspect)) setLast({ pattern: p, aspect: j.aspect }); } catch {}
    try { setDone(new Set(JSON.parse(localStorage.getItem(DONE_KEY) || "[]"))); } catch {}
  }, []);
  const markDoneKey = useCallback((key: string) => {
    setDone((d) => { const n = new Set(d); n.add(key); try { localStorage.setItem(DONE_KEY, JSON.stringify([...n])); } catch {} return n; });
  }, []);
  const markDone = useCallback((pattern: Pattern, aspect: Aspect) => markDoneKey(`${pattern.id}:${aspect}`), [markDoneKey]);

  const start = useCallback((pattern: Pattern, aspect: Aspect = "completed", example?: LabRoot) => {
    setScreen({ kind: "practice", pattern, aspect, example: example ?? pattern.roots[0] });
    setBrowser(false);
    try { localStorage.setItem(LAST_KEY, JSON.stringify({ pattern: pattern.id, aspect })); } catch {}
    setLast({ pattern, aspect });
  }, []);
  const home = useCallback(() => setScreen({ kind: "home" }), []);

  // Esc always steps back toward home. R opens the root browser from home.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) { if (e.key === "Escape") (t as HTMLInputElement).blur(); return; }
      if (browser) { if (e.key === "Escape") setBrowser(false); return; }
      if (e.key === "Escape" && screen.kind !== "home") home();
      else if ((e.key === "r" || e.key === "R") && screen.kind === "home") setBrowser(true);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [browser, screen.kind, home]);

  return (
    <div className="animate-rise flex min-h-[calc(100dvh-5.5rem)] flex-col">
      {browser && <RootBrowser current={screen.kind === "root" ? screen.root.root : ""} onPick={(id) => { const r = getLabRoot(id); if (r) { setScreen({ kind: "root", root: r }); setBrowser(false); } }} onClose={() => setBrowser(false)} />}
      {screen.kind === "home" && <MapView done={done} last={last} onStart={start} onRoots={(direction) => setScreen({ kind: "roots", direction, seed: Date.now() })} onBrowse={() => setBrowser(true)} />}
      {screen.kind === "roots" && <RootsQuiz key={screen.seed} direction={screen.direction} onExit={home} onAgain={() => setScreen({ kind: "roots", direction: screen.direction, seed: Date.now() })} onComplete={() => markDoneKey(`roots:${screen.direction}`)} />}
      {screen.kind === "root" && <RootView root={screen.root} done={done} onPractice={start} onBack={home} />}
      {screen.kind === "practice" && <Session key={`${screen.pattern.id}-${screen.aspect}-${screen.example.root}`} pattern={screen.pattern} aspect={screen.aspect} example={screen.example} onExit={home} onAgain={() => start(screen.pattern, screen.aspect, screen.example)} onComplete={() => markDone(screen.pattern, screen.aspect)} />}
    </div>
  );
}

/* ---------------- The map: family rows × (voice × aspect) columns. Every cell is a session. ---------------- */
function Cell({ p, aspect, root, done, current, onStart }: { p: Pattern | undefined; aspect: Aspect; root?: LabRoot; done: Set<string>; current?: boolean; onStart: (p: Pattern, a: Aspect, example?: LabRoot) => void }) {
  const r = root ?? p?.roots[0];
  if (!p || !r || !r.voices[p.voice]) return <div className="h-14" />;
  const finished = done.has(`${p.id}:${aspect}`);
  return (
    <button onClick={() => onStart(p, aspect, root)} title={`${ROW_LABEL[p.row]} · ${VOICE_LABEL[p.voice].name.toLowerCase()} · ${ASPECT_UI[aspect].name.toLowerCase()}`}
      className={`group flex h-14 w-full flex-col items-center justify-center rounded-xl border transition-colors ${current ? "border-line-strong bg-surface/60" : "border-transparent hover:border-line-strong hover:bg-surface/40"}`}>
      <span className="tl text-[20px] font-medium leading-none" data-aspect={aspect}>{patternForm(p, r, aspect)}</span>
      <span className={`mt-1.5 h-1 w-1 rounded-full ${finished ? "bg-ok" : "bg-transparent group-hover:bg-line-strong"}`} />
    </button>
  );
}

function ColumnHeads() {
  return (
    <>
      <div className="col-span-2 grid grid-cols-6 items-end">
        <div className="col-span-3 border-b border-line pb-2 text-center text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">Actor voice <span className="ml-1 font-normal normal-case tracking-normal text-faint">who did it</span></div>
        <div className="col-span-3 ml-3 border-b border-line pb-2 text-center text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">Object voice <span className="ml-1 font-normal normal-case tracking-normal text-faint">what got done</span></div>
      </div>
      <div />
      <div className="grid grid-cols-6 pb-1 pt-2 text-center text-[11px] text-faint">
        {[0, 1].map((k) => COLS.map((a) => <div key={k + a} className={a === "contemplated" && k === 1 ? "ml-3" : ""}>{ASPECT_UI[a].name.toLowerCase()}</div>))}
      </div>
    </>
  );
}

function MapView({ done, last, onStart, onRoots, onBrowse }: { done: Set<string>; last: { pattern: Pattern; aspect: Aspect } | null; onStart: (p: Pattern, a: Aspect, example?: LabRoot) => void; onRoots: (d: Direction) => void; onBrowse: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-8">
      <div className="text-center text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">Verbs · the map</div>
      <div className="mt-8 grid grid-cols-[88px_1fr] gap-y-1">
        <div />
        <ColumnHeads />
        {ROWS.map((row) => {
          const actor = patternAt(row, "actor"), object = patternAt(row, "object");
          return (
            <div key={row} className="contents">
              <div className="flex flex-col justify-center pr-3">
                <div className="text-[15px] font-semibold tracking-[0.06em] text-question">{ROW_LABEL[row]}</div>
                <div className="text-[11px] text-faint">{actor?.roots.length ?? 0} roots</div>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {COLS.map((a) => <Cell key={"a" + a} p={actor} aspect={a} done={done} current={last?.pattern.id === actor?.id && last?.aspect === a} onStart={onStart} />)}
                {COLS.map((a, k) => <div key={"o" + a} className={k === 0 ? "ml-3" : ""}><Cell p={object} aspect={a} done={done} current={last?.pattern.id === object?.id && last?.aspect === a} onStart={onStart} /></div>)}
              </div>
            </div>
          );
        })}
      </div>
      {/* the roots themselves: meaning, both directions */}
      <div className="mt-8 grid grid-cols-[88px_1fr] gap-y-1 border-t border-line pt-6">
        <div className="flex flex-col justify-center pr-3">
          <div className="text-[15px] font-semibold tracking-[0.06em] text-question">ROOTS</div>
          <div className="text-[11px] text-faint">{MAP_ROOTS.length} words</div>
        </div>
        <div className="grid grid-cols-6 gap-1">
          {([["tl-en", "bili → buy"], ["en-tl", "buy → bili"]] as [Direction, string][]).map(([d, label]) => (
            <button key={d} onClick={() => onRoots(d)} className="group col-span-3 flex h-14 flex-col items-center justify-center rounded-xl border border-transparent transition-colors hover:border-line-strong hover:bg-surface/40">
              <span className="tl text-[20px] font-medium leading-none">{label}</span>
              <span className={`mt-1.5 h-1 w-1 rounded-full ${done.has(`roots:${d}`) ? "bg-ok" : "bg-transparent group-hover:bg-line-strong"}`} />
            </button>
          ))}
        </div>
      </div>
      <div className="mt-10 text-center text-[12.5px] text-faint">
        Pick a cell to practice it across every root in that row. <button onClick={onBrowse} className="ml-2 underline underline-offset-2 hover:text-foreground">See one root</button> <Kbd>R</Kbd>
      </div>
    </div>
  );
}

/* ---------------- One root: its row of the map ---------------- */
function RootView({ root, done, onPractice, onBack }: { root: LabRoot; done: Set<string>; onPractice: (p: Pattern, a: Aspect, example?: LabRoot) => void; onBack: () => void }) {
  const actor = patternOf(root, "actor"), object = patternOf(root, "object");
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center py-8">
      <div className="text-center">
        <div className="tl text-[56px] font-medium uppercase leading-none" data-role="verb">{root.root}</div>
        <div className="mt-2 text-[16px] text-muted">{root.english}</div>
      </div>
      <div className="mt-10 grid grid-cols-[88px_1fr] gap-y-1">
        <div />
        <ColumnHeads />
        <div className="flex flex-col justify-center pr-3">
          <div className="text-[15px] font-semibold tracking-[0.06em] text-question">{actor ? ROW_LABEL[actor.row] : object ? "MA-" : ""}</div>
        </div>
        <div className="grid grid-cols-6 gap-1">
          {COLS.map((a) => <Cell key={"a" + a} p={actor} aspect={a} root={root} done={done} onStart={onPractice} />)}
          {COLS.map((a, k) => <div key={"o" + a} className={k === 0 ? "ml-3" : ""}><Cell p={object} aspect={a} root={root} done={done} onStart={onPractice} /></div>)}
        </div>
      </div>
      {!actor && !object && <div className="mt-6 text-center text-[13px] text-muted">This root only has the ma- form ({root.voices.object?.forms.join(" · ")}).</div>}
      <div className="mt-10 text-center text-[12.5px] text-faint">Pick a form to practice that pattern, starting from {root.root}. <button onClick={onBack} className="ml-2 underline underline-offset-2 hover:text-foreground">Map</button> <Kbd>esc</Kbd></div>
    </div>
  );
}

/* ---------------- A session: example → predict → answer → next ---------------- */
function Session({ pattern, aspect, example, onExit, onAgain, onComplete }: { pattern: Pattern; aspect: Aspect; example: LabRoot; onExit: () => void; onAgain: () => void; onComplete: () => void }) {
  const voice = pattern.voice;
  const [queue, setQueue] = useState(() => pattern.roots.filter((r) => r.root !== example.root));
  const [i, setI] = useState(0);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<null | boolean>(null);
  const [why, setWhy] = useState(false);
  const [score, setScore] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const armedAt = useRef(0);

  const target = queue[i];
  const done = i >= queue.length;
  const answer = target ? patternForm(pattern, target, aspect) : "";
  const history = [example, ...queue.slice(0, i).filter((r, k, a) => a.findIndex((x) => x.root === r.root) === k)];   // what you've seen so far (each root once)

  useEffect(() => { if (!done) setTimeout(() => inputRef.current?.focus(), 30); }, [i, done]);
  const check = () => { if (!target || result !== null || !value.trim()) return; const ok = value.trim().toLowerCase() === answer.toLowerCase(); setResult(ok); armedAt.current = performance.now(); if (ok) setScore((s) => s + 1); recordRepToday(ok, ok ? 1 : 0); };
  const reveal = () => { if (result !== null) return; setResult(false); armedAt.current = performance.now(); recordRepToday(false, 0); };
  // A miss (wrong or "Show me") comes back at the end of the queue until you get it right.
  const next = () => { if (result === false) setQueue((q) => [...q, target]); else if (i + 1 >= queue.length) onComplete(); setI((x) => x + 1); setValue(""); setResult(null); setWhy(false); };

  // Enter after the answer → next. The guard stops the Enter that submitted from also advancing.
  useEffect(() => {
    if (result === null) return;
    const h = (e: KeyboardEvent) => { if (e.metaKey || e.ctrlKey || e.altKey || e.key === "Escape" || e.key === "Shift" || e.key === "Tab") return; if (e.key === "w" || e.key === "W") { e.preventDefault(); setWhy((x) => !x); return; } if (performance.now() - armedAt.current > 150) { e.preventDefault(); next(); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [result]);


  if (done) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center py-8 text-center">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint"><span className="text-question">{pattern.label}</span> · {VOICE_LABEL[pattern.voice].name.toLowerCase()} · {ASPECT_UI[aspect].name.toLowerCase()}</div>
        <div className="mt-6 text-[40px] font-medium leading-none">{score} <span className="text-[20px] text-muted">/ {history.length - 1}</span></div>
        <div className="mt-1 text-[12px] text-faint">first try · the rest came back until you got them</div>
        <div className="tl mt-8 space-y-1 text-[15px] text-muted">
          {history.map((r) => <div key={r.root}><span className="text-foreground">{patternForm(pattern, r, aspect)}</span> <span className="ml-2 font-sans text-[13px] text-faint">{verbEnglish(r, aspect).form}</span></div>)}
        </div>
        <div className="mt-8 flex gap-2">
          <Button variant="primary" size="sm" onClick={onAgain}>Again</Button>
          <Button size="sm" onClick={onExit}>Map</Button>
        </div>
      </div>
    );
  }

  const m = result !== null ? steps(target, aspect, voice) : null;
  const s = result !== null ? labSentence(target, aspect, voice, "ako", true) : null;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col py-6">
      {/* top: pattern name · progress · exit */}
      <div className="flex items-center justify-between text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">
        <span><span className="text-question">{pattern.label}</span> · {VOICE_LABEL[pattern.voice].name.toLowerCase()}</span>
        <span>{queue.length - i} left</span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {/* what you've seen so far: form — meaning, newest last */}
        <div className="tl space-y-1 text-[20px]">
          {history.slice(-5).map((r, k, arr) => (
            <div key={r.root} className={k === arr.length - 1 ? "text-foreground" : "text-muted"}>
              {patternForm(pattern, r, aspect)} <span className="ml-2 font-sans text-[13px] text-faint">{verbEnglish(r, aspect).form}</span>
            </div>
          ))}
        </div>

        <div className="my-8 text-faint">↓</div>

        {result === null ? (
          <div className="w-full animate-rise-fast" key={target.root}>
            <div className="tl text-[64px] font-medium uppercase leading-none" data-role="verb">{target.root}</div>
            <div className="mt-2 text-[16px] text-muted">{target.english}</div>
            <div className="mt-8 text-[13.5px] text-faint">What does it become?</div>
            <div className="mx-auto mt-3 max-w-xs">
              <input ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === "1") { e.preventDefault(); check(); } else if (e.key === "2") { e.preventDefault(); reveal(); } }}
                spellCheck={false} autoComplete="off" autoCapitalize="off" autoCorrect="off"
                className="tl w-full border-0 border-b-2 border-line-strong bg-transparent pb-2 text-center text-[32px] font-medium outline-none focus:border-foreground" />
            </div>
            <div className="mt-6 flex justify-center gap-2">
              <Button variant="primary" size="sm" onClick={check} disabled={!value.trim()}>Check <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">1</Kbd></Button>
              <Button variant="quiet" size="sm" onClick={reveal}>Show me <Kbd>2</Kbd></Button>
            </div>
          </div>
        ) : (
          <div className="w-full animate-rise-fast">
            <div className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${result ? "text-ok" : "text-err"}`}>{result ? "✓ Correct" : "Not quite"}</div>
            <div className="tl mt-3 text-[64px] font-medium uppercase leading-none">
              {m!.soundChange ? <span data-role="verb">{m!.real}</span> : m!.steps[m!.steps.length - 1].pieces.map((p, k) => <span key={k} className={p.kind === "root" ? "text-foreground" : KIND[p.kind]}>{p.text}</span>)}
            </div>
            {!result && value.trim() && <div className="tl mt-2 text-[15px] text-err line-through">{value.trim()}</div>}
            {s && <div className="mt-8"><div className="tl text-[26px] font-medium">{s.tl}</div><div className="mt-1 text-[14px] text-muted">{s.en}</div></div>}
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button variant="quiet" size="sm" onClick={() => setWhy((w) => !w)}>{why ? "Hide" : "Why?"} <Kbd>W</Kbd></Button>
              <Button variant="primary" size="sm" onClick={next}>Next → <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">any key</Kbd></Button>
            </div>
            {why && m && (
              <div className="mt-6 animate-rise text-[13.5px] text-muted">
                <div className="tl flex flex-wrap items-baseline justify-center gap-x-3 text-[22px] font-medium">
                  {m.steps.map((st, k) => <span key={k} className="flex items-baseline gap-3">{k > 0 && <span className="text-faint">→</span>}<span>{st.pieces.map((p, j) => <span key={j} className={KIND[p.kind]}>{p.text}</span>)}</span></span>)}
                  {m.soundChange && <span className="flex items-baseline gap-3"><span className="text-faint">→</span><span data-role="verb">{m.real}</span></span>}
                </div>
                <div className="mt-3 space-y-0.5">{m.steps.slice(1).map((st, k) => <div key={k}>{st.label}</div>)}{m.soundChange && <div>then the sound settles into <span className="tl text-foreground">{m.real}</span></div>}</div>
                <div className="mt-2 text-[12px] text-faint">{VOICE_LABEL[voice].name} · {ASPECT_UI[aspect].sub}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between text-[11.5px] text-faint">
        <button onClick={onExit} className="hover:text-foreground">Map <Kbd>esc</Kbd></button>
        <span>{ASPECT_UI[aspect].name.toLowerCase()}</span>
      </div>
    </div>
  );
}

/* ---------------- Roots quiz: root ↔ meaning, one at a time, shuffled ---------------- */
function shuffle<T>(a: T[]): T[] { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
/** "get / take" → ["get", "take"]; "bathe / shower" → ["bathe", "shower"]. Any one is accepted. */
const meanings = (r: LabRoot) => r.english.split(" (")[0].split(" / ").map((m) => m.trim().toLowerCase());
const norm = (s: string) => s.trim().toLowerCase().replace(/^to /, "");

function RootsQuiz({ direction, onExit, onAgain, onComplete }: { direction: Direction; onExit: () => void; onAgain: () => void; onComplete: () => void }) {
  const [queue, setQueue] = useState(() => shuffle(MAP_ROOTS));
  const [i, setI] = useState(0);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const armedAt = useRef(0);
  const target = queue[i];
  const done = i >= queue.length;
  const history = queue.slice(0, i).filter((r, k, a) => a.findIndex((x) => x.root === r.root) === k);   // each root once

  useEffect(() => { if (!done) setTimeout(() => inputRef.current?.focus(), 30); }, [i, done]);
  const isRight = (v: string) => (direction === "tl-en" ? meanings(target).includes(norm(v)) : norm(v) === target.root);
  const check = () => { if (!target || result !== null || !value.trim()) return; const ok = isRight(value); setResult(ok); armedAt.current = performance.now(); if (ok) setScore((x) => x + 1); recordRepToday(ok, ok ? 1 : 0); };
  const reveal = () => { if (result !== null) return; setResult(false); armedAt.current = performance.now(); recordRepToday(false, 0); };
  // A miss (wrong or "Show me") comes back at the end of the queue until you get it right.
  const next = () => { if (result === false) setQueue((q) => [...q, target]); else if (i + 1 >= queue.length) onComplete(); setI((x) => x + 1); setValue(""); setResult(null); };
  useEffect(() => {
    if (result === null) return;
    const h = (e: KeyboardEvent) => { if (e.metaKey || e.ctrlKey || e.altKey || e.key === "Escape" || e.key === "Shift" || e.key === "Tab") return; if (performance.now() - armedAt.current > 150) { e.preventDefault(); next(); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  const prompt = (r: LabRoot) => (direction === "tl-en" ? r.root : r.english);

  if (done) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center py-8 text-center">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint"><span className="text-question">Roots</span> · {direction === "tl-en" ? "meaning" : "Tagalog"}</div>
        <div className="mt-6 text-[40px] font-medium leading-none">{score} <span className="text-[20px] text-muted">/ {MAP_ROOTS.length}</span></div>
        <div className="mt-1 text-[12px] text-faint">first try · the rest came back until you got them</div>
        <div className="mt-8 flex gap-2"><Button variant="primary" size="sm" onClick={onAgain}>Again</Button><Button size="sm" onClick={onExit}>Map</Button></div>
      </div>
    );
  }
  const ex = target.voices.actor;
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col py-6">
      <div className="flex items-center justify-between text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">
        <span><span className="text-question">Roots</span> · {direction === "tl-en" ? "what does it mean?" : "what's the root?"}</span>
        <span>{queue.length - i} left</span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {history.length > 0 && (
          <div className="space-y-1 text-[15px] text-muted">
            {history.slice(-5).map((r, k, arr) => (
              <div key={r.root} className={k === arr.length - 1 ? "text-foreground" : ""}><span className="tl text-[18px]">{r.root}</span> <span className="ml-2 text-[13px] text-faint">{r.english}</span></div>
            ))}
          </div>
        )}
        {history.length > 0 && <div className="my-8 text-faint">↓</div>}
        {result === null ? (
          <div className="w-full animate-rise-fast" key={target.root}>
            <div className={`font-medium leading-none ${direction === "tl-en" ? "tl text-[64px] uppercase" : "text-[40px]"}`} data-role={direction === "tl-en" ? "verb" : undefined}>{prompt(target)}</div>
            <div className="mx-auto mt-8 max-w-xs">
              <input ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === "1") { e.preventDefault(); check(); } else if (e.key === "2") { e.preventDefault(); reveal(); } }}
                spellCheck={false} autoComplete="off" autoCapitalize="off" autoCorrect="off"
                className={`w-full border-0 border-b-2 border-line-strong bg-transparent pb-2 text-center font-medium outline-none focus:border-foreground ${direction === "en-tl" ? "tl text-[32px]" : "text-[26px]"}`} />
            </div>
            <div className="mt-6 flex justify-center gap-2">
              <Button variant="primary" size="sm" onClick={check} disabled={!value.trim()}>Check <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">1</Kbd></Button>
              <Button variant="quiet" size="sm" onClick={reveal}>Show me <Kbd>2</Kbd></Button>
            </div>
          </div>
        ) : (
          <div className="w-full animate-rise-fast">
            <div className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${result ? "text-ok" : "text-err"}`}>{result ? "✓ Correct" : "Not quite"}</div>
            <div className="mt-3"><span className="tl text-[48px] font-medium uppercase leading-none" data-role="verb">{target.root}</span><span className="ml-4 text-[22px] text-muted">{target.english}</span></div>
            {!result && value.trim() && <div className="mt-2 text-[15px] text-err line-through">{value.trim()}</div>}
            {ex?.ex && <div className="mt-8"><div className="tl text-[26px] font-medium">{ex.ex}</div><div className="mt-1 text-[14px] text-muted">{ex.exEn}</div></div>}
            <div className="mt-8 flex justify-center"><Button variant="primary" size="sm" onClick={next}>Next → <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">any key</Kbd></Button></div>
          </div>
        )}
      </div>
      <div className="flex justify-between text-[11.5px] text-faint"><button onClick={onExit} className="hover:text-foreground">Map <Kbd>esc</Kbd></button><span>{direction === "tl-en" ? "Tagalog → English" : "English → Tagalog"}</span></div>
    </div>
  );
}
