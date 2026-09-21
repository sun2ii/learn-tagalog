"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { LEVELS, buildRun, matches, report, type Attempt, type DeepItem, type Level } from "@/lib/deepEnd";
import { Button, Kbd } from "./ui";
import { recordRepToday } from "@/lib/today";

/* ------------------------------------------------------------------
   DEEP END. The maps with the labels removed. One item at a time, no system named.
   Misses requeue. Timing is silent; the end screen diagnoses which map to go back to.
   ------------------------------------------------------------------ */

type Screen = { kind: "home" } | { kind: "run"; level: Level; seed: number };

export function DeepEnd() {
  const [screen, setScreen] = useState<Screen>({ kind: "home" });
  const home = useCallback(() => setScreen({ kind: "home" }), []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) { if (e.key === "Escape") (t as HTMLInputElement).blur(); return; }
      if (e.key === "Escape" && screen.kind !== "home") home();
      if (screen.kind === "home" && /^[1-3]$/.test(e.key)) setScreen({ kind: "run", level: Number(e.key) as Level, seed: Date.now() });
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [screen.kind, home]);

  return (
    <div className="animate-rise flex min-h-[calc(100dvh-5.5rem)] flex-col">
      {screen.kind === "home" && (
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
          <div className="text-center text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">Deep End</div>
          <div className="mt-2 text-center text-[13px] text-muted">The maps teach. This tests whether you can tell which map you're looking at.</div>
          <div className="mt-8 space-y-2">
            {LEVELS.map((l) => (
              <button key={l.level} onClick={() => setScreen({ kind: "run", level: l.level, seed: Date.now() })} className="flex w-full items-center gap-4 rounded-2xl border border-line px-5 py-4 text-left transition-colors hover:border-line-strong hover:bg-surface/40">
                <span className="text-[28px] font-medium leading-none text-faint">{l.level}</span>
                <span className="flex-1">
                  <span className="block text-[16px] font-semibold">{l.name}</span>
                  <span className="block text-[12.5px] text-muted">{l.what}</span>
                </span>
                <span className="text-[12px] text-faint">{l.count} <Kbd>{l.level}</Kbd></span>
              </button>
            ))}
          </div>
        </div>
      )}
      {screen.kind === "run" && <Run key={screen.seed} level={screen.level} onExit={home} onAgain={() => setScreen({ kind: "run", level: screen.level, seed: Date.now() })} />}
    </div>
  );
}

function Run({ level, onExit, onAgain }: { level: Level; onExit: () => void; onAgain: () => void }) {
  const [queue, setQueue] = useState<DeepItem[]>(() => buildRun(level));
  const [i, setI] = useState(0);
  const [value, setValue] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<null | boolean>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const armedAt = useRef(0);
  const shownAt = useRef(0);
  const firstTry = useRef(new Set<string>());

  const item = queue[i];
  const done = i >= queue.length;

  useEffect(() => { shownAt.current = performance.now(); if (!done && item?.kind === "type") setTimeout(() => inputRef.current?.focus(), 30); }, [i, done, item]);

  const settle = (ok: boolean) => {
    setResult(ok); armedAt.current = performance.now();
    if (!firstTry.current.has(item.id)) { firstTry.current.add(item.id); setAttempts((a) => [...a, { item, correct: ok, ms: performance.now() - shownAt.current }]); }
    recordRepToday(ok, ok ? 1 : 0);
  };
  const check = () => { if (!item || result !== null || !value.trim()) return; settle(matches(value, item)); };
  const choose = (opt: string) => { if (result !== null) return; setPicked(opt); settle(item.answers.includes(opt)); };
  const reveal = () => { if (result !== null) return; settle(false); };
  const next = () => { if (result === false) setQueue((q) => [...q, item]); setI((x) => x + 1); setValue(""); setPicked(null); setResult(null); };

  useEffect(() => {
    if (result === null) {
      if (!item || item.kind !== "choose") return;
      const h = (e: KeyboardEvent) => { if (/^[1-4]$/.test(e.key) && item.options?.[Number(e.key) - 1]) { e.preventDefault(); choose(item.options[Number(e.key) - 1]); } };
      window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
    }
    const h = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key === "Escape" || e.key === "Shift" || e.key === "Tab") return;
      if (performance.now() - armedAt.current > 150) { e.preventDefault(); next(); }
    };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  });

  if (done) return <Summary attempts={attempts} level={level} onAgain={onAgain} onExit={onExit} />;

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col py-6">
      <div className="flex items-center justify-between text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">
        <span>Deep End · {LEVELS[level - 1].name}</span>
        <span>{queue.length - i} left</span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {result === null ? (
          <div className="w-full animate-rise-fast" key={item.id}>
            <div className={`tl font-medium leading-none ${item.main.length > 24 ? "text-[30px]" : "text-[48px]"}`}>{item.main}</div>
            {item.sub && <div className="mt-2 text-[15px] text-muted">{item.sub}</div>}
            <div className="mt-7 text-[13.5px] text-faint">{item.ask}</div>
            {item.kind === "type" ? (
              <>
                <div className="mx-auto mt-3 max-w-sm">
                  <input ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); check(); } else if (e.key === "2" && !value.trim()) { e.preventDefault(); reveal(); } }}
                    spellCheck={false} autoComplete="off" autoCapitalize="off" autoCorrect="off"
                    className="tl w-full border-0 border-b-2 border-line-strong bg-transparent pb-2 text-center text-[26px] font-medium outline-none focus:border-foreground" />
                </div>
                <div className="mt-6 flex justify-center gap-2">
                  <Button variant="primary" size="sm" onClick={check} disabled={!value.trim()}>Check <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">↵</Kbd></Button>
                  <Button variant="quiet" size="sm" onClick={reveal}>Show me</Button>
                </div>
              </>
            ) : (
              <div className="mx-auto mt-4 grid max-w-sm gap-1.5">
                {item.options!.map((o, k) => (
                  <button key={o} onClick={() => choose(o)} className="flex items-center gap-3 rounded-xl border border-line px-4 py-2.5 text-left text-[14.5px] transition-colors hover:border-line-strong hover:bg-surface/40">
                    <Kbd>{k + 1}</Kbd><span>{o}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full animate-rise-fast">
            <div className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${result ? "text-ok" : "text-err"}`}>{result ? "✓ Correct" : "Not quite"}</div>
            <div className="mt-3 text-[13px] text-faint">{item.main}</div>
            <div className={`tl mt-2 font-medium leading-tight ${item.show.length > 30 ? "text-[26px]" : "text-[36px]"}`}>{item.show}</div>
            {!result && (value.trim() || picked) && <div className="mt-2 text-[14px] text-err line-through">{value.trim() || picked}</div>}
            {item.showEn && <div className="mt-3 text-[15px] text-muted">{item.showEn}</div>}
            <div className="mt-8 flex justify-center"><Button variant="primary" size="sm" onClick={next}>Next → <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">any key</Kbd></Button></div>
          </div>
        )}
      </div>
      <div className="flex justify-between text-[11.5px] text-faint"><button onClick={onExit} className="hover:text-foreground">Deep End <Kbd>esc</Kbd></button></div>
    </div>
  );
}

function Summary({ attempts, level, onAgain, onExit }: { attempts: Attempt[]; level: Level; onAgain: () => void; onExit: () => void }) {
  const r = report(attempts);
  const pct = Math.round(r.accuracy * 100);
  const good = r.accuracy >= 0.85;
  const sec = (ms: number) => `${(ms / 1000).toFixed(1)}s`;
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center py-8 text-center">
      <div className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-faint">Deep End · {LEVELS[level - 1].name}</div>
      <div className="mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Accuracy</div>
      <div className={`mt-1 text-[48px] font-medium leading-none ${good ? "text-ok" : ""}`}>{pct}%</div>
      {good && r.medianMs !== null && (
        <>
          <div className="mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Median response</div>
          <div className="mt-1 text-[28px] font-medium leading-none">{sec(r.medianMs)}</div>
          {r.slowest && <><div className="mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Slowest area</div><div className="mt-1 text-[16px]">{r.slowest.area} <span className="text-faint">· {sec(r.slowest.medianMs)}</span></div></>}
        </>
      )}
      {r.needsWork.length > 0 && (
        <>
          <div className="mt-8 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Needs work</div>
          <div className="mt-2 space-y-1">
            {r.needsWork.map((n) => <div key={n.area}><Link href={n.link} className="text-[16px] underline underline-offset-2 hover:text-foreground">{n.area}</Link> <span className="text-[12px] text-faint">· {n.misses} miss{n.misses > 1 ? "es" : ""}</span></div>)}
          </div>
        </>
      )}
      {r.needsWork.length === 0 && <div className="mt-8 text-[14px] text-muted">Nothing missed on first try.</div>}
      <div className="mt-10 flex gap-2"><Button variant="primary" size="sm" onClick={onAgain}>Again</Button><Button size="sm" onClick={onExit}>Levels</Button></div>
    </div>
  );
}
