"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ASPECTS, ASPECT_LABEL, FAMILY_LABEL, AFFIX_LABEL, AFFIX_CHOICES, assemble, firstSyllable, mechanism, normalize, type VerbEx, type Aspect, type Affix } from "@/lib/verbs";
import { Anatomy, Transformation } from "./Sentence";
import { Button, Eyebrow, Kbd } from "./ui";
import { FormPieces, PiecesLegend } from "./FormPieces";

/* One verb rep. Three shapes, one lesson: form = root + family + aspect. */

interface Props { ex: VerbEx; onAnswer: (c: boolean) => void; onContinue: () => void }

function useContinueKeys(active: boolean, onContinue: () => void) {
  useEffect(() => {
    if (!active) return;
    const armedAt = performance.now();
    const h = (e: KeyboardEvent) => { if (e.timeStamp <= armedAt) return; if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onContinue(); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [active, onContinue]);
}

const Shade = ({ a }: { a: Aspect }) => <span data-aspect={a} className="font-semibold">{ASPECT_LABEL[a]}</span>;

export function VerbRep({ ex, onAnswer, onContinue }: Props) {
  if (ex.sub === "build") return <BuildForm ex={ex} onAnswer={onAnswer} onContinue={onContinue} />;
  if (ex.sub === "conjugate") return <Conjugate ex={ex} onAnswer={onAnswer} onContinue={onContinue} />;
  if (ex.sub === "recognize") return <Recognize ex={ex} onAnswer={onAnswer} onContinue={onContinue} />;
  return <Swap ex={ex} onAnswer={onAnswer} onContinue={onContinue} />;
}

/* ---- Conjugate: root + aspect → form. Type it, or pick from six. ---- */
function Conjugate({ ex, onAnswer, onContinue }: Props & { ex: Extract<VerbEx, { sub: "conjugate" }> }) {
  const [value, setValue] = useState("");
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<null | boolean>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setValue(""); setPicked(null); setResult(null); setTimeout(() => inputRef.current?.focus(), 30); }, [ex]);
  const submit = useCallback((ans: string) => {
    if (result !== null) return;
    const ok = normalize(ans) === normalize(ex.answer);
    setPicked(ans); setResult(ok); onAnswer(ok);
  }, [result, ex, onAnswer]);
  useContinueKeys(result !== null, onContinue);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (result !== null || e.metaKey || e.ctrlKey) return;
      if (/^[1-6]$/.test(e.key) && !value) { const o = ex.options[Number(e.key) - 1]; if (o) { e.preventDefault(); submit(o); } }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [ex, result, value, submit]);

  return (
    <div className="animate-rise-fast text-center">
      <Eyebrow>Conjugate · {FAMILY_LABEL[ex.verb.family]}</Eyebrow>
      <div className="mt-4 flex items-baseline justify-center gap-4">
        <span className="tl text-[44px] font-medium leading-none md:text-[56px]" data-role="verb">{ex.verb.root}</span>
        <span className="text-[15px] text-muted">{ex.verb.meaning}</span>
      </div>
      <div className="mt-3 text-[15px]"><Shade a={ex.aspect} /></div>

      <div className="mx-auto mt-8 max-w-md">
        <input ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)} disabled={result !== null}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (value.trim()) submit(value); } }}
          placeholder="Type the form…" spellCheck={false} autoComplete="off" autoCapitalize="off" autoCorrect="off"
          className={`tl w-full border-0 border-b-2 bg-transparent pb-2 text-center text-[30px] font-medium outline-none placeholder:font-sans placeholder:text-[16px] placeholder:text-faint md:text-[36px] ${result === null ? "border-line-strong focus:border-foreground" : result ? "border-ok text-ok" : "border-err text-err animate-shake"}`} />
      </div>
      <div className="mx-auto mt-6 flex max-w-2xl flex-wrap justify-center gap-2">
        {ex.options.map((o, i) => {
          const isAns = normalize(o) === normalize(ex.answer);
          const tone = result === null ? "border-line hover:border-line-strong" : isAns ? "!border-ok !text-ok" : picked === o ? "!border-err !text-err" : "opacity-40";
          return (
            <button key={o} onClick={() => submit(o)} disabled={result !== null} className={`group relative rounded-lg border bg-card px-3.5 py-1.5 transition-colors ${tone}`}>
              <span className="tl text-[22px] font-medium leading-none">{o}</span>
              {result === null && !value && <Kbd className="absolute -right-1.5 -top-1.5 !h-4 !min-w-4 !text-[9px] opacity-0 group-hover:opacity-100">{i + 1}</Kbd>}
            </button>
          );
        })}
      </div>
      {result !== null && (
        <div className="mx-auto mt-8 max-w-xl space-y-3 animate-rise">
          <div className={`text-[12px] font-semibold uppercase tracking-[0.12em] ${result ? "text-ok" : "text-err"}`}>{result ? "Tama" : "Not quite"}</div>
          <div className="tl flex flex-wrap items-baseline justify-center gap-x-5 text-[26px] font-medium">
            {ex.verb.forms.map((f, i) => <span key={f} data-aspect={ASPECTS[i]} className={ASPECTS[i] === ex.aspect ? "underline decoration-2 underline-offset-4" : "opacity-70"}>{f}</span>)}
          </div>
          <div className="text-[14px] text-muted">{mechanism(ex.verb, ex.aspect)}</div>
          {ex.verb.ex && <div className="tl text-[16px] text-muted">{ex.verb.ex} <span className="font-sans text-[13px] text-faint">{ex.verb.exEn}</span></div>}
          <Button variant="primary" onClick={onContinue} className="mt-2 animate-pop">Continue <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">⎵</Kbd></Button>
        </div>
      )}
    </div>
  );
}

/* ---- Recognize: form → aspect (0 ½ 1), then root. ---- */
function Recognize({ ex, onAnswer, onContinue }: Props & { ex: Extract<VerbEx, { sub: "recognize" }> }) {
  const [asp, setAsp] = useState<Aspect | null>(null);
  const [root, setRoot] = useState<string | null>(null);
  const done = asp !== null && root !== null;
  const ok = asp === ex.aspect && root === ex.verb.root;
  useEffect(() => { setAsp(null); setRoot(null); }, [ex]);
  useEffect(() => { if (done) onAnswer(ok); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [done]);
  useContinueKeys(done, onContinue);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (done || e.metaKey || e.ctrlKey) return;
      if (asp === null && /^[1-3]$/.test(e.key)) { e.preventDefault(); setAsp(ASPECTS[Number(e.key) - 1]); }
      else if (asp !== null && /^[1-4]$/.test(e.key)) { e.preventDefault(); const r = ex.rootOptions[Number(e.key) - 1]; if (r) setRoot(r); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [asp, done, ex]);

  return (
    <div className="animate-rise-fast text-center">
      <Eyebrow>Recognize</Eyebrow>
      <div className="tl mt-4 text-[48px] font-medium leading-none md:text-[60px]" data-aspect={done ? ex.aspect : undefined} data-role={done ? undefined : "verb"} style={done ? undefined : { color: "var(--foreground)" }}>{ex.form}</div>

      <div className="mt-8">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-faint">How far along?</div>
        <div className="mt-2 flex justify-center gap-2">
          {ASPECTS.map((a, i) => {
            const tone = asp === null ? "border-line hover:border-line-strong" : a === ex.aspect ? "!border-ok !text-ok" : asp === a ? "!border-err !text-err" : "opacity-40";
            return <button key={a} onClick={() => asp === null && setAsp(a)} className={`rounded-lg border bg-card px-4 py-2 text-[14px] transition-colors ${tone}`}><span data-aspect={asp === null ? a : undefined}>{ASPECT_LABEL[a]}</span> <Kbd className="ml-1">{i + 1}</Kbd></button>;
          })}
        </div>
      </div>
      {asp !== null && (
        <div className="mt-6 animate-rise">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-faint">Which root?</div>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {ex.rootOptions.map((r, i) => {
              const tone = root === null ? "border-line hover:border-line-strong" : r === ex.verb.root ? "!border-ok !text-ok" : root === r ? "!border-err !text-err" : "opacity-40";
              return <button key={r} onClick={() => root === null && setRoot(r)} className={`rounded-lg border bg-card px-4 py-1.5 transition-colors ${tone}`}><span className="tl text-[20px] font-medium">{r}</span> <Kbd className="ml-1">{i + 1}</Kbd></button>;
            })}
          </div>
        </div>
      )}
      {done && (
        <div className="mx-auto mt-8 max-w-xl space-y-3 animate-rise">
          <div className={`text-[12px] font-semibold uppercase tracking-[0.12em] ${ok ? "text-ok" : "text-err"}`}>{ok ? "Tama" : "Not quite"}</div>
          <div className="text-[15px]"><span className="tl text-[20px]" data-role="verb">{ex.verb.root}</span> <span className="text-muted">{ex.verb.meaning}</span> · {FAMILY_LABEL[ex.verb.family]} · <Shade a={ex.aspect} /></div>
          <div className="text-[14px] text-muted">{mechanism(ex.verb, ex.aspect)}</div>
          <Button variant="primary" onClick={onContinue} className="mt-2 animate-pop">Continue <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">⎵</Kbd></Button>
        </div>
      )}
    </div>
  );
}

/* ---- Swap: same sentence, new verb. Type the whole sentence. ---- */
function Swap({ ex, onAnswer, onContinue }: Props & { ex: Extract<VerbEx, { sub: "swap" }> }) {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<null | boolean>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setValue(""); setResult(null); setTimeout(() => inputRef.current?.focus(), 30); }, [ex]);
  const submit = () => { if (result !== null || !value.trim()) return; const ok = normalize(value) === normalize(ex.to.tagalog); setResult(ok); onAnswer(ok); };
  useContinueKeys(result !== null, onContinue);
  return (
    <div className="animate-rise-fast text-center">
      <Eyebrow>Swap the verb</Eyebrow>
      <div className="mt-4"><Anatomy parts={ex.from.parts} state={{ ...ex.state, root: ex.from.parts[0].key ?? ex.state.root }} size="md" /></div>
      <div className="mt-1 text-[14px] text-muted">{ex.fromEn}</div>
      <div className="mt-6 text-[16px]">now with <span className="tl text-[24px] font-medium" data-role="verb">{ex.toRoot}</span>{ex.state.focus === "object" && <span className="ml-2 rounded-md border border-line px-1.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-faint">object focus</span>} <span className="text-muted">({ex.verb.meaning})</span>{ex.state.object && <span className="text-muted"> and <span className="tl text-[20px]" data-role="object">{ex.to.parts.find((p) => p.dimension === "object")?.text}</span></span>}</div>
      <div className="mx-auto mt-6 max-w-2xl">
        <input ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)} disabled={result !== null}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submit(); } }}
          placeholder="Type the new sentence…" spellCheck={false} autoComplete="off" autoCapitalize="off" autoCorrect="off"
          className={`tl w-full border-0 border-b-2 bg-transparent pb-2 text-center text-[28px] font-medium outline-none placeholder:font-sans placeholder:text-[16px] placeholder:text-faint md:text-[34px] ${result === null ? "border-line-strong focus:border-foreground" : result ? "border-ok text-ok" : "border-err text-err animate-shake"}`} />
        <div className="mt-4 flex justify-end">
          {result === null ? <Button variant="primary" onClick={submit} disabled={!value.trim()}>Check <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">↵</Kbd></Button>
            : <Button variant="primary" onClick={onContinue} className="animate-pop">Continue <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">⎵</Kbd></Button>}
        </div>
      </div>
      {result !== null && (
        <div className="mx-auto mt-8 max-w-2xl space-y-4 animate-rise">
          <div className={`text-[12px] font-semibold uppercase tracking-[0.12em] ${result ? "text-ok" : "text-err"}`}>{result ? "Tama" : "Not quite"}</div>
          <Transformation from={ex.from.parts} to={ex.to.parts} toState={ex.state} showRoles size="sm" label={`${ex.from.parts[0].text.toLowerCase()} → ${ex.to.parts[0].text.toLowerCase()}`} />
          <div className="text-[14px] text-muted">{ex.toEn}</div>
          <div className="text-[14px] text-muted">{mechanism(ex.verb, ex.aspect)}</div>
        </div>
      )}
    </div>
  );
}

/* ---- Build the form: apply the two operations yourself; the word assembles from them. ---- */
function BuildForm({ ex, onAnswer, onContinue }: Props & { ex: Extract<VerbEx, { sub: "build" }> }) {
  const [dbl, setDbl] = useState<boolean | null>(null);
  const [affix, setAffix] = useState<Affix | null>(null);
  const done = dbl !== null && affix !== null;
  const ok = done && dbl === ex.rule.double && affix === ex.rule.affix;
  const root = ex.verb.root;
  const syl = firstSyllable(root);
  const choices = AFFIX_CHOICES[ex.verb.family];
  useEffect(() => { setDbl(null); setAffix(null); }, [ex]);
  useEffect(() => { if (done) onAnswer(ok); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [done]);
  useContinueKeys(done, onContinue);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (done || e.metaKey || e.ctrlKey) return;
      if (dbl === null && (e.key === "1" || e.key === "2")) { e.preventDefault(); setDbl(e.key === "1"); }
      else if (dbl !== null && /^[1-3]$/.test(e.key)) { const a = choices[Number(e.key) - 1]; if (a) { e.preventDefault(); setAffix(a); } }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [dbl, done, choices]);

  // Live assembly of what you've chosen so far.
  const naive = done ? assemble(root, ex.rule.double, ex.rule.affix) : "";
  const soundChange = done && normalize(naive) !== normalize(ex.answer);

  return (
    <div className="animate-rise-fast text-center">
      <Eyebrow>Build the form · {FAMILY_LABEL[ex.verb.family]}</Eyebrow>
      <div className="mt-4 flex items-baseline justify-center gap-4">
        <span className="tl text-[44px] font-medium leading-none md:text-[56px]" data-role="verb">{root}</span>
        <span className="text-[15px] text-muted">{ex.verb.meaning}</span>
      </div>
      <div className="mt-3 text-[15px]"><Shade a={ex.aspect} /></div>

      {/* The word, assembling from its pieces */}
      <div className="mx-auto mt-8 flex max-w-lg flex-col items-center gap-2">
        <div className="min-h-[40px]">{dbl === null ? <span className="tl text-[34px] font-medium text-foreground">{root}</span> : <FormPieces root={root} double={dbl} affix={affix ?? "none"} size="lg" />}</div>
        <PiecesLegend />
      </div>

      {/* Step 1 */}
      <div className="mt-8">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-faint">1 · Double the first syllable ({syl})?</div>
        <div className="mt-2 flex justify-center gap-2">
          {[true, false].map((v, i) => {
            const tone = dbl === null ? "border-line hover:border-line-strong" : v === ex.rule.double ? "!border-ok !text-ok" : dbl === v ? "!border-err !text-err" : "opacity-40";
            return <button key={String(v)} onClick={() => dbl === null && setDbl(v)} className={`rounded-lg border bg-card px-4 py-2 text-[14px] transition-colors ${tone}`}>{v ? "Yes" : "No"} → <FormPieces root={root} double={v} affix="none" size="sm" /> <Kbd className="ml-1">{i + 1}</Kbd></button>;
          })}
        </div>
      </div>
      {/* Step 2 */}
      {dbl !== null && (
        <div className="mt-6 animate-rise">
          <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-faint">2 · Which affix?</div>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {choices.map((a, i) => {
              const tone = affix === null ? "border-line hover:border-line-strong" : a === ex.rule.affix ? "!border-ok !text-ok" : affix === a ? "!border-err !text-err" : "opacity-40";
              return <button key={a} onClick={() => affix === null && setAffix(a)} className={`rounded-lg border bg-card px-4 py-2 text-[14px] transition-colors ${tone}`}>{AFFIX_LABEL[a]} → <FormPieces root={root} double={dbl} affix={a} size="sm" /> <Kbd className="ml-1">{i + 1}</Kbd></button>;
            })}
          </div>
        </div>
      )}

      {done && (
        <div className="mx-auto mt-8 max-w-xl space-y-3 animate-rise">
          <div className={`text-[12px] font-semibold uppercase tracking-[0.12em] ${ok ? "text-ok" : "text-err"}`}>{ok ? "Tama" : "Not quite"}</div>
          <div className="flex items-baseline justify-center gap-4"><FormPieces root={root} double={ex.rule.double} affix={ex.rule.affix} size="lg" /><span className="text-faint">=</span><span className="tl text-[32px] font-medium" data-aspect={ex.aspect}>{ex.answer}</span></div>
          <div className="text-[14px] text-muted">
            <span className="font-semibold text-foreground">{ex.rule.double ? `double ${syl}` : "no doubling"}</span> + <span className="font-semibold text-foreground">{AFFIX_LABEL[ex.rule.affix]}</span>
            {soundChange && <span> — the rule gives <span className="tl">{naive}</span>; the real word is <span className="tl">{ex.answer}</span> (a sound change on this root — memorize the exception, the rule is still right).</span>}
          </div>
          <div className="tl flex flex-wrap items-baseline justify-center gap-x-5 text-[20px]">
            {ex.verb.forms.map((f, i) => <span key={f} data-aspect={ASPECTS[i]} className={ASPECTS[i] === ex.aspect ? "underline decoration-2 underline-offset-4" : "opacity-60"}>{f}</span>)}
          </div>
          <Button variant="primary" onClick={onContinue} className="mt-2 animate-pop">Continue <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">⎵</Kbd></Button>
        </div>
      )}
    </div>
  );
}
