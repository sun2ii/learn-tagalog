"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { PARTICLE_GROUPS, getParticleCell, sameSentence, type ParticleCell, type ParticleItem } from "@/content/particles";
import { Button, Kbd } from "./ui";
import { recordRepToday } from "@/lib/today";

/* ------------------------------------------------------------------
   PARTICLE PRACTICE. Same machine as the verb map:
   the map (groups × particles) → a session (base sentence → add the particle → meaning shift → next).
   ------------------------------------------------------------------ */

const DONE_KEY = "tagalog.particles.done";
const LAST_KEY = "tagalog.particles.last";

type Screen = { kind: "home" } | { kind: "practice"; cell: ParticleCell; seed: number };

export function ParticlePractice() {
  const [screen, setScreen] = useState<Screen>({ kind: "home" });
  const [done, setDone] = useState<Set<string>>(new Set());
  const [last, setLast] = useState<string | null>(null);

  useEffect(() => {
    try { setDone(new Set(JSON.parse(localStorage.getItem(DONE_KEY) || "[]"))); } catch {}
    try { const l = localStorage.getItem(LAST_KEY); if (l && getParticleCell(l)) setLast(l); } catch {}
  }, []);
  const markDone = useCallback((id: string) => {
    setDone((d) => { const n = new Set(d); n.add(id); try { localStorage.setItem(DONE_KEY, JSON.stringify([...n])); } catch {} return n; });
  }, []);
  const start = useCallback((cell: ParticleCell) => { setScreen({ kind: "practice", cell, seed: Date.now() }); setLast(cell.id); try { localStorage.setItem(LAST_KEY, cell.id); } catch {} }, []);
  const home = useCallback(() => setScreen({ kind: "home" }), []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) { if (e.key === "Escape") (t as HTMLInputElement).blur(); return; }
      if (e.key === "Escape" && screen.kind !== "home") home();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [screen.kind, home]);

  return (
    <div className="animate-rise flex min-h-[calc(100dvh-5.5rem)] flex-col">
      {screen.kind === "home" && <MapView done={done} last={last} onStart={start} />}
      {screen.kind === "practice" && <Session key={screen.seed} cell={screen.cell} onExit={home} onAgain={() => start(screen.cell)} onComplete={() => markDone(screen.cell.id)} />}
    </div>
  );
}

/* ---------------- The map ---------------- */
function MapView({ done, last, onStart }: { done: Set<string>; last: string | null; onStart: (c: ParticleCell) => void }) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center py-8">
      <div className="text-center text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">Particles · the map</div>
      <div className="mt-8 grid grid-cols-[120px_1fr] gap-y-2">
        {PARTICLE_GROUPS.map((g) => (
          <div key={g.id} className="contents">
            <div className="flex flex-col justify-center pr-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{g.name}</div>
            </div>
            <div className="flex flex-wrap gap-1">
              {g.cells.map((c) => {
                const ex = c.items[0];
                return (
                  <button key={c.id} onClick={() => onStart(c)} title={c.sense}
                    className={`group flex min-w-[140px] flex-col items-start rounded-xl border px-4 py-2.5 text-left transition-colors ${last === c.id ? "border-line-strong bg-surface/60" : "border-transparent hover:border-line-strong hover:bg-surface/40"}`}>
                    <span className="flex items-center gap-2">
                      <span className="tl text-[22px] font-medium leading-none text-question">{c.label}</span>
                      <span className={`h-1 w-1 rounded-full ${done.has(c.id) ? "bg-ok" : "bg-transparent group-hover:bg-line-strong"}`} />
                    </span>
                    <span className="tl mt-1.5 text-[13px] text-muted">{ex.base.replace(/[.?]$/, "")} <span className="text-faint">→</span> {ex.out.replace(/[.?]$/, "")}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 text-center text-[12.5px] text-faint">Verbs change the event. Particles change how you frame it. Pick one; the sentence stays, the particle goes in.</div>
    </div>
  );
}

/* ---------------- A session ---------------- */
function Session({ cell, onExit, onAgain, onComplete }: { cell: ParticleCell; onExit: () => void; onAgain: () => void; onComplete: () => void }) {
  const example = cell.items[0];
  const [queue, setQueue] = useState<ParticleItem[]>(() => cell.items.slice(1));
  const [i, setI] = useState(0);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<null | boolean>(null);
  const [why, setWhy] = useState(false);
  const [score, setScore] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const armedAt = useRef(0);

  const target = queue[i];
  const done = i >= queue.length;
  const history = [example, ...queue.slice(0, i).filter((x, k, a) => a.findIndex((y) => y.out === x.out) === k)];

  useEffect(() => { if (!done) setTimeout(() => inputRef.current?.focus(), 30); }, [i, done]);
  const check = () => { if (!target || result !== null || !value.trim()) return; const ok = sameSentence(value, target.out); setResult(ok); armedAt.current = performance.now(); if (ok) setScore((s) => s + 1); recordRepToday(ok, ok ? 1 : 0); };
  const reveal = () => { if (result !== null) return; setResult(false); armedAt.current = performance.now(); recordRepToday(false, 0); };
  const next = () => { if (result === false) setQueue((q) => [...q, target]); else if (i + 1 >= queue.length) onComplete(); setI((x) => x + 1); setValue(""); setResult(null); setWhy(false); };
  useEffect(() => {
    if (result === null) return;
    const h = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key === "Escape" || e.key === "Shift" || e.key === "Tab") return;
      if (e.key === "w" || e.key === "W") { e.preventDefault(); setWhy((x) => !x); return; }
      if (performance.now() - armedAt.current > 150) { e.preventDefault(); next(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });

  if (done) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center py-8 text-center">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint"><span className="text-question">{cell.label}</span></div>
        <div className="mt-6 text-[40px] font-medium leading-none">{score} <span className="text-[20px] text-muted">/ {cell.items.length - 1}</span></div>
        <div className="mt-1 text-[12px] text-faint">first try · the rest came back until you got them</div>
        <div className="tl mt-8 space-y-1 text-[15px] text-muted">{history.map((x) => <div key={x.out}><span className="text-foreground">{x.out}</span> <span className="ml-2 font-sans text-[13px] text-faint">{x.outEn}</span></div>)}</div>
        <div className="mt-8 flex gap-2"><Button variant="primary" size="sm" onClick={onAgain}>Again</Button><Button size="sm" onClick={onExit}>Map</Button></div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col py-6">
      <div className="flex items-center justify-between text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">
        <span className="text-question">{cell.label}</span>
        <span>{queue.length - i} left</span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {/* what you've seen: the particle sentences so far, newest last */}
        <div className="tl space-y-1 text-[20px]">
          {history.slice(-4).map((x, k, arr) => (
            <div key={x.out} className={k === arr.length - 1 ? "text-foreground" : "text-muted"}>
              {x.out} <span className="ml-2 font-sans text-[13px] text-faint">{x.outEn}</span>
            </div>
          ))}
        </div>

        <div className="my-8 text-faint">↓</div>

        {result === null ? (
          <div className="w-full animate-rise-fast" key={target.out}>
            <div className="tl text-[40px] font-medium leading-none">{target.base}</div>
            <div className="mt-2 text-[15px] text-muted">{target.baseEn}</div>
            <div className="mt-8 text-[13.5px] text-faint">
              {cell.ask === "add" ? <>Add <span className="tl text-[16px] text-question">{cell.label}</span></> : <>Make it mean: <span className="text-[15px] text-foreground">{target.outEn}</span></>}
            </div>
            <div className="mx-auto mt-3 max-w-sm">
              <input ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === "1") { e.preventDefault(); check(); } else if (e.key === "2") { e.preventDefault(); reveal(); } }}
                spellCheck={false} autoComplete="off" autoCapitalize="off" autoCorrect="off"
                className="tl w-full border-0 border-b-2 border-line-strong bg-transparent pb-2 text-center text-[28px] font-medium outline-none focus:border-foreground" />
            </div>
            <div className="mt-6 flex justify-center gap-2">
              <Button variant="primary" size="sm" onClick={check} disabled={!value.trim()}>Check <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">1</Kbd></Button>
              <Button variant="quiet" size="sm" onClick={reveal}>Show me <Kbd>2</Kbd></Button>
            </div>
          </div>
        ) : (
          <div className="w-full animate-rise-fast">
            <div className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${result ? "text-ok" : "text-err"}`}>{result ? "✓ Correct" : "Not quite"}</div>
            <div className="tl mt-3 text-[40px] font-medium leading-none"><Highlight out={target.out} base={target.base} /></div>
            {!result && value.trim() && <div className="tl mt-2 text-[15px] text-err line-through">{value.trim()}</div>}
            <div className="mt-4 text-[17px] text-muted">{target.outEn}</div>
            <div className="mt-1 text-[12.5px] text-faint">was: {target.baseEn}</div>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Button variant="quiet" size="sm" onClick={() => setWhy((w) => !w)}>{why ? "Hide" : "Why?"} <Kbd>W</Kbd></Button>
              <Button variant="primary" size="sm" onClick={next}>Next → <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">any key</Kbd></Button>
            </div>
            {why && (
              <div className="mt-6 animate-rise text-[13.5px] text-muted">
                <div>{cell.sense}</div>
                <div className="mt-2 text-[12.5px] text-faint">{cell.rule}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-between text-[11.5px] text-faint"><button onClick={onExit} className="hover:text-foreground">Map <Kbd>esc</Kbd></button>{cell.check && <span>English readings pending native check</span>}</div>
    </div>
  );
}

/** The answer with the added word(s) in purple: whatever is in `out` but not in `base`. */
function Highlight({ out, base }: { out: string; base: string }) {
  const baseWords = base.toLowerCase().replace(/[.?!]/g, "").split(/\s+/);
  const counts = new Map<string, number>(); baseWords.forEach((w) => counts.set(w, (counts.get(w) ?? 0) + 1));
  return (
    <>
      {out.split(/(\s+)/).map((tok, k) => {
        if (/^\s+$/.test(tok)) return tok;
        const w = tok.toLowerCase().replace(/[.?!]/g, "");
        const n = counts.get(w) ?? 0;
        if (n > 0) { counts.set(w, n - 1); return <span key={k}>{tok}</span>; }
        return <span key={k} className="text-question">{tok}</span>;
      })}
    </>
  );
}
