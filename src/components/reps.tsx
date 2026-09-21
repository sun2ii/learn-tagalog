"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SentencePart } from "@/languages/tagalog/renderer";
import { Anatomy, Line, Transformation, roleLabel } from "./Sentence";
import { Button, Eyebrow, Kbd } from "./ui";
import { distractorsFor, isCorrect, shuffle, wordBank, wrongTokens, type SentenceEx, type CardEx } from "@/lib/exercises";
import { rateCard } from "@/lib/learner";
import { SymbolicPrompt } from "./SymbolicPrompt";
import { Info } from "./PieceInfo";
import { verdicts } from "@/lib/slots";

/* ------------------------------------------------------------------
   One rep = one exercise on screen. Two shapes:
   TypedRep  – read a prompt, type the Tagalog, see why.
   BuildRep  – assemble the Tagalog from pieces, see the roles.
   Both report exactly one result, then wait for Continue.
   ------------------------------------------------------------------ */

export interface RepProps {
  ex: SentenceEx;
  onAnswer: (correct: boolean) => void;
  onContinue: () => void;
}

type Result = null | "correct" | "incorrect";

/** Space / Enter continue once answered, without stealing keys from text entry. */
function useContinueKeys(active: boolean, onContinue: () => void) {
  useEffect(() => {
    if (!active) return;
    // React flushes effects inside the same discrete event that answered the rep,
    // so the Enter that submitted would also "continue". Ignore anything already in flight.
    const armedAt = performance.now();
    const h = (e: KeyboardEvent) => {
      if (e.timeStamp <= armedAt) return;
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onContinue(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [active, onContinue]);
}

function ResultLabel({ result }: { result: Result }) {
  if (!result) return null;
  return (
    <div className={`text-[12px] font-semibold uppercase tracking-[0.12em] animate-fade ${result === "correct" ? "text-ok" : "text-err"}`}>
      {result === "correct" ? "Tama" : "Not quite"}
    </div>
  );
}

/* ---------------- Typed ---------------- */

export function TypedRep({ ex, onAnswer, onContinue }: RepProps) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<Result>(null);
  const [bank, setBank] = useState<boolean>(() => { try { return localStorage.getItem("tagalog.bank") === "1"; } catch { return false; } });
  const [symbols, setSymbols] = useState<boolean>(() => { try { return localStorage.getItem("tagalog.prompt") !== "en"; } catch { return true; } });
  const inputRef = useRef<HTMLInputElement>(null);
  const isQ = ex.kind === "question";

  useEffect(() => { setValue(""); setResult(null); setTimeout(() => inputRef.current?.focus(), 30); }, [ex]);

  const submit = useCallback(() => {
    if (result) { onContinue(); return; }
    if (!value.trim()) return;
    const ok = isCorrect(value, ex);
    setResult(ok ? "correct" : "incorrect");
    onAnswer(ok);
  }, [result, value, ex, onAnswer, onContinue]);

  useContinueKeys(result !== null, onContinue);

  const toggleBank = () => { setBank((b) => { try { localStorage.setItem("tagalog.bank", b ? "0" : "1"); } catch {} return !b; }); inputRef.current?.focus(); };
  const append = (w: string) => { setValue((v) => (v ? `${v} ${w}` : w)); inputRef.current?.focus(); };
  const bankRows = useMemo(() => wordBank(ex.state), [ex]);

  const inputTone =
    result === "correct" ? "border-ok text-ok" : result === "incorrect" ? "border-err text-err animate-shake" : "border-line-strong focus:border-foreground";

  return (
    <div className="animate-rise-fast">
      {/* Prompt */}
      <div className="text-center">
        {isQ && ex.from ? (
          <>
            <Eyebrow>Start from</Eyebrow>
            <Line text={ex.from.tagalog} size="md" className="mt-3" />
            <div className="mt-5 text-[17px] font-medium text-muted md:text-[19px]">{ex.instruction}</div>
          </>
        ) : (
          <>
            <Eyebrow>Build this</Eyebrow>
            {symbols ? (
              <div className="mt-4"><SymbolicPrompt state={ex.state} /></div>
            ) : (
              <div className="mt-3 text-[26px] font-medium leading-tight tracking-tight md:text-[34px]">{ex.target.english}</div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div className="mx-auto mt-10 max-w-2xl">
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }}
          disabled={result !== null}
          placeholder={isQ ? "Type the question…" : "Type in Tagalog…"}
          spellCheck={false} autoComplete="off" autoCapitalize="off" autoCorrect="off"
          aria-label="Your answer"
          className={`tl w-full border-0 border-b-2 bg-transparent px-1 pb-3 text-center text-[28px] font-medium leading-tight outline-none transition-colors placeholder:text-faint placeholder:font-sans placeholder:text-[18px] disabled:opacity-100 md:text-[36px] ${inputTone}`}
        />
        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[13px] text-muted">
            <button onClick={toggleBank} className="hover:text-foreground">{bank ? "Hide words" : "Show words"}</button>
            {!isQ && (
              <button onClick={() => { setSymbols((v) => { try { localStorage.setItem("tagalog.prompt", v ? "en" : "sym"); } catch {} return !v; }); inputRef.current?.focus(); }} className="hover:text-foreground">
                {symbols ? "English" : "Symbols"}
              </button>
            )}
          </div>
          {result === null ? (
            <Button variant="primary" onClick={submit} disabled={!value.trim()}>Check <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">↵</Kbd></Button>
          ) : (
            <Button variant="primary" onClick={onContinue} className="animate-pop">Continue <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">⎵</Kbd></Button>
          )}
        </div>
      </div>

      {/* Word bank (progressive disclosure) */}
      {bank && result === null && (
        <div className="mx-auto mt-6 max-w-2xl space-y-2 animate-fade">
          {bankRows.map((row) => (
            <div key={row.label} className="flex flex-wrap items-center gap-1.5">
              <span className="w-28 shrink-0 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-faint">{row.label}</span>
              {row.words.map((w) => (
                <button key={w} onClick={() => append(w)} data-role={row.role}
                  className="tl rounded-md border border-line bg-card px-2 py-0.5 text-[16px] transition-colors hover:border-current">
                  {w}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Reveal */}
      {result && (
        <div className="mx-auto mt-10 max-w-2xl space-y-8">
          <div className="text-center"><ResultLabel result={result} /></div>
          {result === "incorrect" && (
            <div className="text-center">
              <Eyebrow>Your answer</Eyebrow>
              <div className="tl mt-2 text-[22px] font-medium text-muted md:text-[26px]">
                {wrongTokens(value, ex).map((t, i) => (
                  <span key={i} className={t.wrong ? "text-err line-through decoration-2" : ""}>{t.text}{" "}</span>
                ))}
              </div>
            </div>
          )}
          {isQ && ex.from && ex.base ? (
            <Transformation from={ex.from.parts} to={ex.target.parts} fromState={ex.base} toState={ex.state} showRoles size="md" label={ex.instruction} />
          ) : (
            <>
              <Anatomy parts={ex.target.parts} state={ex.state} showRoles size="md" />
              {symbols && <div className="text-center text-[15px] text-muted">{ex.target.english}</div>}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- Build ---------------- */

interface Piece extends SentencePart { id: number; }

export function BuildRep({ ex, onAnswer, onContinue }: RepProps) {
  const [bank, setBank] = useState<Piece[]>([]);
  const [placed, setPlaced] = useState<Piece[]>([]);
  const [result, setResult] = useState<Result>(null);
  const [revealed, setRevealed] = useState(false);
  const [wrongIdx, setWrongIdx] = useState<Set<number>>(new Set());
  const [shake, setShake] = useState(false);
  const answered = useRef(false);
  const targetLen = ex.target.parts.length;

  useEffect(() => {
    const pieces: Piece[] = [...ex.target.parts.map((p) => ({ ...p, text: p.text.toLowerCase() })), ...distractorsFor(ex)].map((p, i) => ({ ...p, id: i }));
    setBank(shuffle(pieces)); setPlaced([]); setResult(null); setRevealed(false); setWrongIdx(new Set()); answered.current = false;
  }, [ex]);

  const evaluate = useCallback((seq: Piece[]) => {
    const ok = seq.every((p, i) => p.text.toLowerCase() === ex.target.parts[i].text.toLowerCase());
    if (!answered.current) { answered.current = true; onAnswer(ok); }
    if (ok) { setResult("correct"); setWrongIdx(new Set()); }
    else {
      setWrongIdx(new Set(seq.map((p, i) => (p.text.toLowerCase() === ex.target.parts[i].text.toLowerCase() ? -1 : i)).filter((i) => i >= 0)));
      setShake(true); setTimeout(() => setShake(false), 400);
    }
  }, [ex, onAnswer]);

  const allow = useMemo(() => verdicts(placed, bank.map((p) => p.text)), [placed, bank]);

  const place = useCallback((piece: Piece) => {
    if (result) return;
    if (allow[piece.text] && !allow[piece.text].allowed) return;
    setBank((b) => b.filter((p) => p.id !== piece.id));
    setPlaced((s) => { const n = [...s, piece]; if (n.length === targetLen) evaluate(n); return n; });
  }, [result, targetLen, evaluate, allow]);

  const unplace = useCallback((idx: number) => {
    if (result) return;
    setPlaced((s) => { const back = s.slice(idx); setBank((b) => [...b, ...back]); return s.slice(0, idx); });
    setWrongIdx(new Set());
  }, [result]);

  const reveal = () => {
    if (!answered.current) { answered.current = true; onAnswer(false); }
    setRevealed(true); setResult("incorrect");
  };

  // Keys: 1–9 pick from the bank, Backspace removes the last piece.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (result) return;
      if (/^[1-9]$/.test(e.key)) { const p = bank[Number(e.key) - 1]; if (p) { e.preventDefault(); place(p); } }
      else if (e.key === "Backspace" && placed.length) { e.preventDefault(); unplace(placed.length - 1); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [bank, placed, result, place, unplace]);

  useContinueKeys(result !== null, onContinue);

  const solvedParts = revealed ? ex.target.parts : placed;
  const isQ = ex.state.mood && ex.state.mood !== "statement";

  return (
    <div className="animate-rise-fast">
      <div className="text-center">
        <Eyebrow>Build</Eyebrow>
        <div className="mt-3 text-[26px] font-medium leading-tight tracking-tight md:text-[34px]">{ex.target.english}</div>
      </div>

      {/* Sentence line */}
      <div className={`mx-auto mt-12 flex min-h-[72px] max-w-3xl flex-wrap items-end justify-center gap-x-3 gap-y-4 ${shake ? "animate-shake" : ""}`}>
        {solvedParts.map((p, i) => {
          const wrong = wrongIdx.has(i);
          const text = i === 0 ? p.text.charAt(0).toUpperCase() + p.text.slice(1) : p.text;
          return (
            <button key={i} onClick={() => unplace(i)} disabled={result !== null}
              className="flex flex-col items-center animate-pop">
              <span data-role={result === "correct" || revealed ? p.dimension : undefined} data-aspect={(result === "correct" || revealed) && p.dimension === "verb" ? ex.state.aspect : undefined}
                className={`tl rounded-lg border px-3 py-1.5 text-[26px] font-medium leading-none transition-colors md:text-[34px] ${wrong ? "border-err text-err" : result === "correct" || revealed ? "border-transparent" : "border-line-strong bg-card"}`}>
                {text}{i === targetLen - 1 && result ? <span className="text-foreground">{isQ ? "?" : "."}</span> : null}
              </span>
              {(result === "correct" || revealed) && (
                <span className="mt-2 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-faint animate-rise" style={{ animationDelay: `${i * 45}ms` }}>
                  {roleOf(p, ex)}
                </span>
              )}
            </button>
          );
        })}
        {!result && Array.from({ length: Math.max(0, targetLen - placed.length) }).map((_, i) => (
          <span key={`slot-${i}`} className="mb-2 h-[3px] w-14 rounded-full bg-line md:w-20" />
        ))}
      </div>

      {/* Bank */}
      {!result && (
        <div className="mx-auto mt-12 flex max-w-2xl flex-wrap justify-center gap-2.5">
          {bank.map((p, i) => {
            const ok = allow[p.text]?.allowed ?? true;
            return (
              <button key={p.id} onClick={() => place(p)} aria-disabled={!ok}
                className={`group relative rounded-lg border px-3.5 py-2 text-[22px] transition-[transform,border-color,box-shadow,opacity] duration-150 hover:z-30 md:text-[26px] ${ok ? "border-line bg-card hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_2px_10px_-4px_rgba(0,0,0,0.25)] active:translate-y-0 active:scale-95" : "cursor-help border-transparent bg-surface/60 text-faint opacity-60"}`}>
                <span className="tl font-medium leading-none">{p.text}</span>
                {ok && <Kbd className="absolute -right-1.5 -top-1.5 !h-4 !min-w-4 !text-[9px] opacity-0 transition-opacity group-hover:opacity-100">{i + 1}</Kbd>}
                <Info word={p.text} reason={ok ? undefined : allow[p.text]?.reason} />
              </button>
            );
          })}
        </div>
      )}

      <div className="mx-auto mt-10 flex max-w-2xl items-center justify-between">
        {!result ? (
          <>
            <span className="text-[12px] text-faint"><Kbd>1</Kbd>–<Kbd>9</Kbd> pick · <Kbd>⌫</Kbd> undo</span>
            <button onClick={reveal} className="text-[13px] text-muted hover:text-foreground">Show answer</button>
          </>
        ) : (
          <>
            <ResultLabel result={result} />
            <Button variant="primary" onClick={onContinue} className="animate-pop">Continue <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">⎵</Kbd></Button>
          </>
        )}
      </div>
    </div>
  );
}

function roleOf(p: SentencePart, ex: SentenceEx): string {
  return roleLabel(p, ex.state);
}

/* ---------------- Card (flashcard inside a session) ---------------- */

export function CardRep({ ex, onAnswer, onContinue }: { ex: CardEx; onAnswer: (c: boolean) => void; onContinue: () => void }) {
  const [shown, setShown] = useState(false);
  useEffect(() => { setShown(false); }, [ex]);
  const rate = useCallback((gotIt: boolean) => { rateCard(ex.card.id, gotIt); onAnswer(gotIt); onContinue(); }, [ex, onAnswer, onContinue]);
  useEffect(() => {
    const armedAt = performance.now();
    const h = (e: KeyboardEvent) => {
      if (e.timeStamp <= armedAt) return;
      if (!shown) { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setShown(true); } return; }
      if (e.key === "1" || e.key === "ArrowLeft") { e.preventDefault(); rate(false); }
      else if (e.key === "2" || e.key === "ArrowRight" || e.key === " " || e.key === "Enter") { e.preventDefault(); rate(true); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [shown, rate]);
  return (
    <div className="flex flex-col items-center text-center animate-rise-fast">
      <Eyebrow>Recall</Eyebrow>
      <div className="mt-4 max-w-2xl text-[28px] font-medium leading-tight tracking-tight md:text-[36px]">{ex.card.front}</div>
      <div className="mt-12 min-h-[120px]">
        {shown ? (
          <div className="animate-rise">
            <div className="tl text-[36px] font-medium leading-tight md:text-[46px]" data-aspect={ex.card.aspect}>{ex.card.back}</div>
            {ex.card.sub && <div className="tl mt-2 text-[18px] text-muted">{ex.card.sub}</div>}
            {ex.card.note && <div className="mx-auto mt-4 max-w-md text-[14px] text-muted">{ex.card.note}</div>}
          </div>
        ) : (
          <Button variant="primary" size="lg" onClick={() => setShown(true)}>Reveal <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">⎵</Kbd></Button>
        )}
      </div>
      {shown && (
        <div className="mt-8 flex gap-3 animate-fade">
          <Button size="lg" onClick={() => rate(false)} className="!border-err/50 !text-err">Again <Kbd>1</Kbd></Button>
          <Button size="lg" onClick={() => rate(true)} className="!border-ok/50 !text-ok">Got it <Kbd>2</Kbd></Button>
        </div>
      )}
    </div>
  );
}
