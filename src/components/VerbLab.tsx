"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ASPECTS, type Aspect } from "@/lib/verbs";
import { ASPECT_UI, CATEGORIES, LAB_ROOTS, PATTERNS, VOICE_LABEL, categoryOf, getLabRoot, getPattern, labSentence, patternForm, patternOf, patternTargets, steps, type LabRoot, type Pattern, type Voice } from "@/lib/verbLab";
import { Button, Eyebrow, Kbd } from "./ui";
import { recordRepToday } from "@/lib/today";

/* ------------------------------------------------------------------
   VERB LAB. One root. One change. One visible transformation. One sentence.
   Hierarchy: root → transformed form → meaning → sentence → controls → structure → morphology.
   ------------------------------------------------------------------ */

const PRONOUNS_UI: [string, string][] = [["ako", "I"], ["ikaw", "you"], ["siya", "he / she"], ["kami", "we"], ["tayo", "we (incl.)"], ["kayo", "you all"], ["sila", "they"]];
const KIND = { affix: "text-question", double: "text-time", root: "text-foreground" } as const;

interface Memory { aspects: string[]; voice: boolean; roots: string[] }
function readMemory(): Memory { try { return { aspects: [], voice: false, roots: [], ...JSON.parse(localStorage.getItem("tagalog.lab.v1") || "{}") }; } catch { return { aspects: [], voice: false, roots: [] }; } }
function writeMemory(m: Memory) { try { localStorage.setItem("tagalog.lab.v1", JSON.stringify(m)); } catch {} }

export function VerbLab() {
  const [rootId, setRootId] = useState("kain");
  const [aspect, setAspect] = useState<Aspect>("completed");
  const [voice, setVoice] = useState<Voice>("actor");
  const [pronoun, setPronoun] = useState("ako");
  const [withObject, setWithObject] = useState(true);
  const [browser, setBrowser] = useState(false);
  const [patternId, setPatternId] = useState<string | null>(null);   // the pattern the root was chosen from, if any
  const [mem, setMem] = useState<Memory>({ aspects: [], voice: false, roots: [] });
  const [panel, setPanel] = useState<"structure" | "built" | "voice" | "try">("structure");
  const canVoiceRef = useRef(false);
  const [flash, setFlash] = useState(0);
  const predictRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const m = readMemory(); setMem(m);
    try {
      const r = localStorage.getItem("tagalog.lab.root"); if (r && getLabRoot(r)) setRootId(r);
      const p = getPattern(localStorage.getItem("tagalog.lab.pattern")); if (p && r && p.roots.some((x) => x.root === r)) { setPatternId(p.id); setVoice(p.voice); }
    } catch {}
  }, []);
  const remember = useCallback((patch: Partial<Memory>) => { setMem((m) => { const n = { ...m, ...patch }; writeMemory(n); return n; }); }, []);

  const root = getLabRoot(rootId) ?? LAB_ROOTS[0];
  const hasVoice = (v: Voice) => !!root.voices[v];
  // If the current voice isn't available on this root, fall back.
  useEffect(() => { if (!root.voices[voice]) setVoice(root.voices.actor ? "actor" : "object"); }, [root, voice]);
  const v = root.voices[voice] ? voice : root.voices.actor ? "actor" : "object";
  const form = root.voices[v]!.forms[ASPECTS.indexOf(aspect)];
  const sentence = useMemo(() => labSentence(root, aspect, v, pronoun, withObject), [root, aspect, v, pronoun, withObject]);
  const morph = useMemo(() => steps(root, aspect, v), [root, aspect, v]);
  const other = v === "actor" ? "object" : "actor";
  const otherSentence = useMemo(() => (root.voices[other] ? labSentence(root, aspect, other, pronoun, true) : null), [root, aspect, other, pronoun]);

  const pickAspect = useCallback((a: Aspect) => { setAspect(a); setFlash((f) => f + 1); remember({ aspects: Array.from(new Set([...mem.aspects, a])) }); }, [mem.aspects, remember]);
  const pickVoice = useCallback((x: Voice) => { if (!root.voices[x]) return; setVoice(x); setFlash((f) => f + 1); remember({ voice: true }); }, [root, remember]);
  /** Pick a root. `from` = the pattern it was chosen from (PATTERN view / "try another"), null = chosen by meaning. */
  const pickRoot = useCallback((id: string, from: Pattern | null = null) => {
    setRootId(id); setBrowser(false); setFlash((f) => f + 1);
    setPatternId(from ? from.id : null);
    if (from) setVoice(from.voice);   // the pattern *is* a voice — keep showing it
    try { localStorage.setItem("tagalog.lab.root", id); if (from) localStorage.setItem("tagalog.lab.pattern", from.id); else localStorage.removeItem("tagalog.lab.pattern"); } catch {}
    remember({ roots: Array.from(new Set([...mem.roots, id])) });
  }, [mem.roots, remember]);

  // Keys: ← → aspect · 1 2 3 · A / O voice · R root · esc closes
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) { if (e.key === "Escape") (t as HTMLInputElement).blur(); return; }
      if (browser) { if (e.key === "Escape") setBrowser(false); return; }
      const i = ASPECTS.indexOf(aspect);
      if (e.key === "ArrowRight") { e.preventDefault(); pickAspect(ASPECTS[Math.min(2, i + 1)]); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); pickAspect(ASPECTS[Math.max(0, i - 1)]); }
      else if (/^[1-3]$/.test(e.key)) { e.preventDefault(); pickAspect(ASPECTS[Number(e.key) - 1]); }
      else if (e.key === "a" || e.key === "A") { pickVoice("actor"); if (canVoiceRef.current) setPanel("voice"); }
      else if (e.key === "o" || e.key === "O") { pickVoice("object"); if (canVoiceRef.current) setPanel("voice"); }
      else if (e.key === "r" || e.key === "R") setBrowser(true);
      else if (e.key === "h" || e.key === "H") setPanel((p) => (p === "built" ? "structure" : "built"));
      else if (e.key === "t" || e.key === "T") setPanel("try");
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [aspect, browser, pickAspect, pickVoice]);

  const cat = categoryOf(root.root);
  const canVoice = hasVoice("actor") && hasVoice("object");
  canVoiceRef.current = canVoice;
  const livePattern = patternOf(root, v);                                 // the morphology on screen right now
  const fromPattern = patternId && livePattern?.id === patternId ? livePattern : null;  // …and it was chosen as a pattern

  return (
    <div className="animate-rise flex min-h-[calc(100dvh-5.5rem)] flex-col">
      {browser && <RootBrowser current={root.root} onPick={pickRoot} onClose={() => setBrowser(false)} />}

      {/* Row 1 · root + the two controls, one line */}
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="flex items-end gap-4">
          <div>
            <Eyebrow>Verb Lab · root</Eyebrow>
            <div className="tl mt-1 text-[52px] font-medium uppercase leading-none tracking-[0.02em]" data-role="verb">{root.root}</div>
          </div>
          <div className="pb-1">
            <div className="text-[17px] text-muted">{root.english}</div>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <button onClick={() => setBrowser(true)} className="text-[12.5px] text-foreground underline underline-offset-2">Change root <Kbd>R</Kbd></button>
              {fromPattern
                ? <><span className="rounded-md bg-surface px-1.5 py-0.5 text-[11px] text-muted"><span className="text-question">{fromPattern.label.toLowerCase()}</span> · {VOICE_LABEL[fromPattern.voice].name.toLowerCase()}</span><button onClick={() => setPanel("try")} className="text-[12px] text-muted underline underline-offset-2 hover:text-foreground">Try another from this pattern <Kbd>T</Kbd></button></>
                : cat && <span className="text-[12px] text-faint">{cat.name}</span>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <div className="flex items-baseline justify-between"><Eyebrow>Aspect · how far along?</Eyebrow><span className="ml-3 text-[10px] text-faint"><Kbd>←</Kbd><Kbd>→</Kbd></span></div>
            <div className="mt-1.5 flex rounded-lg border border-line p-0.5">
              {ASPECTS.map((a, i) => (
                <button key={a} onClick={() => pickAspect(a)} aria-pressed={aspect === a} className={`rounded-md px-3 py-1.5 text-left transition-colors ${aspect === a ? "bg-surface" : "hover:bg-surface/50"}`}>
                  <div className={`text-[13.5px] font-semibold leading-none ${aspect === a ? "text-foreground" : "text-muted"}`}>{ASPECT_UI[a].name} <span className="ml-1 text-[10px] font-normal text-faint">{i + 1}</span></div>
                  <div className="mt-1 text-[10px] leading-none text-faint">{ASPECT_UI[a].sub.split(" ·")[0]}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between"><Eyebrow>Voice · centered on</Eyebrow><span className="ml-3 text-[10px] text-faint"><Kbd>A</Kbd><Kbd>O</Kbd></span></div>
            <div className={`mt-1.5 flex rounded-lg border border-line p-0.5 ${canVoice ? "" : "opacity-40"}`}>
              {(["actor", "object"] as Voice[]).map((x) => (
                <button key={x} onClick={() => { pickVoice(x); if (canVoice) setPanel("voice"); }} disabled={!root.voices[x]} aria-pressed={v === x} className={`rounded-md px-3 py-1.5 text-left transition-colors disabled:cursor-default ${v === x ? "bg-surface" : "hover:bg-surface/50"}`}>
                  <div className={`text-[13.5px] font-semibold leading-none ${v === x ? "text-foreground" : "text-muted"}`}>{x === "actor" ? "Actor" : "Object"}</div>
                  <div className="mt-1 text-[10px] leading-none text-faint">{x === "actor" ? "who does it" : "the thing"}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Row 2 · the transformation, then the sentence — each on one line */}
      <section key={`${root.root}-${aspect}-${v}-${flash}`} className="mt-7">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
          <span className="tl text-[24px] text-muted">{root.root}</span>
          <span className="text-faint">→</span>
          <span className="tl text-[56px] font-medium leading-none animate-pop md:text-[64px]">
            {morph.soundChange ? <span data-aspect={aspect}>{morph.real}</span> : morph.steps[morph.steps.length - 1].pieces.map((p, i) => <span key={i} className={KIND[p.kind]}>{p.text}</span>)}
          </span>
          <span className="ml-2 text-[11px] text-faint">
            {morph.steps.some((st) => st.label.startsWith("repeat")) && <span className="text-time">repeated syllable</span>}
            {morph.steps.some((st) => st.label.startsWith("repeat")) && morph.steps.some((st) => st.label.startsWith("add")) && " · "}
            {morph.steps.some((st) => st.label.startsWith("add")) && <span className="text-question">affix</span>}
            {morph.steps.length > 1 ? " · root" : "unchanged root"}
            {morph.soundChange && <span> · sound change</span>}
          </span>
        </div>
        {sentence && (
          <div className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <span className="tl whitespace-nowrap text-[32px] font-medium leading-none md:text-[38px]">{sentence.tl}</span>
            <span className="text-[16px] text-muted">{sentence.en}</span>
          </div>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted">
          <span className="flex items-center gap-0.5"><span className="mr-1 text-faint">who</span>
            {PRONOUNS_UI.map(([p, en]) => <button key={p} onClick={() => setPronoun(p)} title={en} className={`rounded px-1.5 py-0.5 ${pronoun === p ? "bg-surface text-foreground" : "hover:text-foreground"}`}>{p === "ikaw" ? "ka" : p}</button>)}
          </span>
          {(root.object || root.place) && v === "actor" && <button onClick={() => setWithObject((x) => !x)} className="hover:text-foreground">{withObject ? "shorter" : `+ ${root.object ? "object" : "place"}`}</button>}
        </div>
      </section>

      {/* Row 3 · one panel, four tabs — nothing below the fold */}
      <section className="mt-6 flex min-h-0 flex-1 flex-col rounded-2xl border border-line">
        <div className="flex items-center gap-1 border-b border-line px-3 pt-2">
          {([["structure", "Structure"], ["built", "How it's built"], ["voice", "Voice: what changed"], ["try", "Try the pattern"]] as const).map(([id, label]) => (
            <button key={id} onClick={() => setPanel(id)} disabled={id === "voice" && !canVoice} className={`-mb-px rounded-t-md border-b-2 px-3 py-2 text-[13px] transition-colors disabled:opacity-30 ${panel === id ? "border-foreground text-foreground" : "border-transparent text-muted hover:text-foreground"}`}>{label}{id === "built" && <Kbd className="ml-1.5">H</Kbd>}</button>
          ))}
          <span className="ml-auto pb-1 text-[11px] text-faint">{root.voices[v]!.family === "um" ? "-um- family" : root.voices[v]!.family === "mag" ? "mag- family" : root.voices[v]!.family === "ma" ? "ma- family" : "-in- · object voice"}</span>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {panel === "structure" && sentence && <Structure sentence={sentence} />}
          {panel === "built" && <Built morph={morph} aspect={aspect} family={root.voices[v]!.family} />}
          {panel === "voice" && canVoice && sentence && otherSentence && <VoiceCompare a={v === "actor" ? sentence : otherSentence} b={v === "actor" ? otherSentence : sentence} current={v} pronoun={pronoun} />}
          {panel === "try" && livePattern && <Predict root={root} form={form} aspect={aspect} pattern={livePattern} seen={mem.roots} onPick={pickRoot} />}
        </div>
      </section>
      <div className="mt-2 flex justify-between text-[11px] text-faint">
        <span>Tap any piece in Structure for its role in this sentence.</span>
        <span>Reps: <Link href="/verbs/drill/?kind=build&family=all&reps=20" className="text-muted hover:text-foreground">Build</Link> · <Link href="/verbs/drill/?kind=recognize&family=all&reps=20" className="text-muted hover:text-foreground">Recognize</Link> · <Link href="/verbs/drill/?kind=swap&family=all&reps=20" className="text-muted hover:text-foreground">Swap</Link></span>
      </div>
    </div>
  );
}

/* ---------------- How it's built ---------------- */
function Built({ morph, aspect, family }: { morph: ReturnType<typeof steps>; aspect: Aspect; family: string }) {
  return (
    <div>
      <ol className="space-y-2.5">
        {morph.steps.map((s, i) => (
          <li key={i} className="flex items-baseline gap-4">
            <span className="w-5 shrink-0 text-[12px] tabular-nums text-faint">{i + 1}</span>
            <span className="tl w-44 shrink-0 text-[24px] font-medium leading-none">{s.pieces.map((p, k) => <span key={k} className={KIND[p.kind]}>{p.text}</span>)}</span>
            <span className="text-[13.5px] text-muted">{s.label}</span>
          </li>
        ))}
        {morph.soundChange && (
          <li className="flex items-baseline gap-4">
            <span className="w-5 shrink-0 text-[12px] tabular-nums text-faint">{morph.steps.length + 1}</span>
            <span className="tl w-44 shrink-0 text-[24px] font-medium leading-none" data-aspect={aspect}>{morph.real}</span>
            <span className="text-[13.5px] text-muted">a sound change on this root — same rule, the letters shift. Memorize this one.</span>
          </li>
        )}
      </ol>
      <div className="mt-4 text-[12.5px] text-muted">
        <span className="text-time">Amber</span> = the repeated syllable (<em>reduplication</em>) — repetition means <em>not finished</em>, so Not yet and Happening repeat, Done doesn&rsquo;t. <span className="text-question">Purple</span> = the affix: {family === "um" ? "-um-, placed inside the root after its first consonant" : family === "mag" ? "mag-, which becomes nag- once the action has started" : family === "ma" ? "ma-, which becomes na- once the action has started" : "-in-, the object-voice marker — inside the root once started, at the end while not yet"}.
      </div>
    </div>
  );
}

/* ---------------- Structure: the sentence as quiet labeled pieces ---------------- */
function Structure({ sentence }: { sentence: NonNullable<ReturnType<typeof labSentence>> }) {
  const [open, setOpen] = useState<number | null>(null);
  const ROLE = { verb: "verb", actor: "actor", marker: "marker", object: "object", place: "place" } as const;
  const ATTR = { verb: "verb", actor: "actor", marker: "particle", object: "object", place: "time" } as const;
  return (
    <section>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {sentence.pieces.map((p, i) => (
          <button key={i} onClick={() => setOpen(open === i ? null : i)} className={`flex flex-col items-center rounded-lg px-2 py-1 transition-colors ${open === i ? "bg-surface" : "hover:bg-surface/60"}`}>
            <span className="tl text-[24px] font-medium leading-none" data-role={ATTR[p.role]}>{p.text}</span>
            <span className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-faint">{ROLE[p.role]}</span>
          </button>
        ))}
      </div>
      {open !== null && (
        <div className="mt-3 max-w-xl rounded-lg border border-line px-4 py-3 text-[13.5px] text-muted animate-fade">
          <span className="tl text-[17px] text-foreground" data-role={ATTR[sentence.pieces[open].role]}>{sentence.pieces[open].text}</span> — {sentence.pieces[open].explain}
        </div>
      )}
    </section>
  );
}

/* ---------------- Voice comparison: what changed ---------------- */
function VoiceCompare({ a, b, current, pronoun }: { a: NonNullable<ReturnType<typeof labSentence>>; b: NonNullable<ReturnType<typeof labSentence>>; current: Voice; pronoun: string }) {
  const pairs = a.pieces.map((p, i) => [p, b.pieces[i]] as const).filter(([x, y]) => y && x.text.toLowerCase() !== y.text.toLowerCase());
  const ATTR = { verb: "verb", actor: "actor", marker: "particle", object: "object", place: "time" } as const;
  return (
    <div>
      <div className="grid gap-6 md:grid-cols-2">
        {[a, b].map((s, k) => {
          const isCur = (k === 0) === (current === "actor");
          return (
            <div key={k} className={isCur ? "" : "opacity-60"}>
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-faint">{k === 0 ? "actor voice" : "object voice"}</div>
              <div className="tl mt-1.5 flex flex-nowrap gap-x-[0.3em] whitespace-nowrap text-[24px] font-medium leading-tight">
                {s.pieces.map((p, i) => { const changed = pairs.some(([x, y]) => x === p || y === p); const last = i === s.pieces.length - 1; return <span key={i} data-role={changed ? ATTR[p.role] : undefined} className={changed ? "" : "text-muted"}>{p.text}{last ? <span className="text-muted">.</span> : null}</span>; })}
              </div>
              <div className="mt-1 text-[13.5px] text-muted">{s.en}</div>
            </div>
          );
        })}
      </div>
      <div className="mt-4 border-t border-line pt-3">
        <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-faint">What changed</div>
        <ul className="mt-2 space-y-1.5">
          {pairs.map(([x, y], i) => (
            <li key={i} className="flex items-baseline gap-3 text-[14px]">
              <span className="tl text-[20px]" data-role={ATTR[x.role]}>{x.text}</span><span className="text-faint">→</span><span className="tl text-[20px]" data-role={ATTR[y.role]}>{y.text}</span>
              <span className="text-muted">{x.role === "verb" ? "the verb takes the object-voice marker -in-" : x.role === "actor" ? `same person ("${PRONOUNS_UI.find(([p]) => p === pronoun)?.[1]}"), different form — the actor is no longer the center` : "the object becomes the center of the sentence, so its marker changes"}</span>
            </li>
          ))}
        </ul>
        <div className="mt-3 text-[13px] text-muted">Changing voice moves more than the verb: the verb, the pronoun form and the marker shift together.</div>
      </div>
    </div>
  );
}

/* ---------------- Predict: try the pattern on a compatible root ---------------- */
function Predict({ root, form, aspect, pattern, seen, onPick }: { root: LabRoot; form: string; aspect: Aspect; pattern: Pattern; seen: string[]; onPick: (id: string, from: Pattern) => void }) {
  const voice = pattern.voice;
  const targets = useMemo(() => patternTargets(pattern, root.root, seen), [pattern, root.root, seen]);
  const [target, setTarget] = useState<LabRoot | null>(null);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<null | boolean>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Same pattern, next root: the first fresh target is offered right away — no picking step before the question.
  useEffect(() => { setTarget(targets[0] ?? null); setValue(""); setResult(null); setTimeout(() => inputRef.current?.focus(), 30); }, [root, aspect, pattern, targets]);
  const next = () => { if (!target) return; const i = targets.indexOf(target); setTarget(targets[(i + 1) % targets.length]); setValue(""); setResult(null); setTimeout(() => { inputRef.current?.focus(); inputRef.current?.scrollIntoView({ block: "nearest" }); }, 30); };
  // After the answer is shown, Enter moves to the next root. armedAt guards against the same Enter that submitted also continuing.
  const armedAt = useRef(0);
  const revealRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (result !== null) requestAnimationFrame(() => revealRef.current?.scrollIntoView({ block: "end", behavior: "smooth" })); }, [result]);
  useEffect(() => { if (result !== null) armedAt.current = performance.now(); }, [result]);
  useEffect(() => {
    if (result === null || targets.length < 2) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Enter" && performance.now() - armedAt.current > 150) { e.preventDefault(); next(); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });
  if (!target) return <div className="text-[13px] text-muted">No other root follows this pattern yet.</div>;
  const answer = patternForm(pattern, target, aspect);
  const check = () => { if (result !== null || !value.trim()) return; const ok = value.trim().toLowerCase() === answer.toLowerCase(); setResult(ok); recordRepToday(ok, ok ? 1 : 0); };
  const m = steps(target, aspect, voice);
  const s = labSentence(target, aspect, voice, "ako", true);
  return (
    <section>
      <Eyebrow><span className="text-question">{pattern.label.toLowerCase()}</span> · {VOICE_LABEL[voice].name.toLowerCase()} · {ASPECT_UI[aspect].name.toLowerCase()}</Eyebrow>
      <div className="mt-2 text-center animate-rise-fast" key={target.root}>
        <div className="text-[14px] text-muted">You&rsquo;ve seen <span className="tl font-medium uppercase text-foreground">{root.root}</span> <span className="text-faint">→</span> <span className="tl font-medium uppercase text-foreground">{form}</span>.</div>
        <div className="mt-1 text-[15px] text-muted">What happens to <span className="tl text-[22px] font-medium uppercase text-foreground" data-role="verb">{target.root}</span> <span className="text-[13px] text-faint">({target.english})</span>?</div>
        <div className="mx-auto mt-2 max-w-sm">
          <input ref={inputRef} value={value} onChange={(e) => setValue(e.target.value)} disabled={result !== null}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); check(); } }}
            spellCheck={false} autoComplete="off" autoCapitalize="off" autoCorrect="off" placeholder="your guess…"
            className={`tl w-full border-0 border-b-2 bg-transparent pb-2 text-center text-[28px] font-medium outline-none placeholder:font-sans placeholder:text-[15px] placeholder:text-faint ${result === null ? "border-line-strong focus:border-foreground" : result ? "border-ok text-ok" : "border-err text-err animate-shake"}`} />
        </div>
        <div className="mt-3 flex justify-center gap-2">
          {result === null ? <><Button variant="primary" size="sm" onClick={check} disabled={!value.trim()}>Check <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">↵</Kbd></Button><Button size="sm" onClick={() => { setResult(false); }}>Reveal</Button>{targets.length > 1 && <Button size="sm" onClick={next}>Different root</Button>}</>
            : <>{targets.length > 1 && <Button size="sm" onClick={next}>Another from this pattern <Kbd>↵</Kbd></Button>}<Button variant="primary" size="sm" onClick={() => onPick(target.root, pattern)}>Explore {target.root}</Button></>}
        </div>
          {result !== null && m && (
            <div ref={revealRef} className="mt-3 animate-rise">
              <div className={`text-[12px] font-semibold uppercase tracking-[0.12em] ${result ? "text-ok" : "text-err"}`}>{result ? "Correct" : "Not quite"}</div>
              <div className="mt-2 flex flex-wrap items-baseline justify-center gap-x-3">
                {m.steps.map((st, i) => (
                  <span key={i} className="flex items-baseline gap-3"><span className="tl text-[26px] font-medium leading-none">{st.pieces.map((p, k) => <span key={k} className={KIND[p.kind]}>{p.text}</span>)}</span>{i < m.steps.length - 1 && <span className="text-faint">→</span>}</span>
                ))}
                {m.soundChange && <span className="flex items-baseline gap-3"><span className="text-faint">→</span><span className="tl text-[26px] font-medium" data-aspect={aspect}>{m.real}</span></span>}
              </div>
              {s && <div className="mt-2"><div className="tl text-[24px] font-medium">{s.tl}</div><div className="text-[14px] text-muted">{s.en}</div></div>}
            </div>
          )}
      </div>
    </section>
  );
}

/* ---------------- Root browser: PATTERN (morphology, default) · MEANING (semantics), search, no navigation ---------------- */
type BrowserView = "pattern" | "meaning";
const VIEW_KEY = "tagalog.lab.browser";

/** `root → form` with the affix / repeated syllable colored, read from the validated tables. */
function PatternForm({ p, r }: { p: Pattern; r: LabRoot }) {
  const m = steps(r, "completed", p.voice);
  const last = m.steps[m.steps.length - 1];
  return (
    <span className="tl font-medium">
      {m.soundChange ? <span data-role="verb">{m.real}</span> : last.pieces.map((x, i) => <span key={i} className={KIND[x.kind]}>{x.text}</span>)}
    </span>
  );
}

export function RootBrowser({ current, onPick, onClose }: { current: string; onPick: (id: string, from: Pattern | null) => void; onClose: () => void }) {
  const [q, setQ] = useState("");
  const [view, setView] = useState<BrowserView>("pattern");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 30); try { const v = localStorage.getItem(VIEW_KEY); if (v === "meaning" || v === "pattern") setView(v); } catch {} }, []);
  const choose = (v: BrowserView) => { setView(v); try { localStorage.setItem(VIEW_KEY, v); } catch {} };
  const match = (r: LabRoot) => !q || r.root.includes(q.toLowerCase()) || r.english.toLowerCase().includes(q.toLowerCase());
  useEffect(() => { const prev = document.body.style.overflow; document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = prev; }; }, []);
  if (typeof document === "undefined") return null;
  // Portal to <body>: the page wrapper animates with a transform, which would otherwise capture position:fixed.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[85dvh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-card p-6 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.6)] animate-pop" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Eyebrow>Change root</Eyebrow>
            <div className="flex rounded-md border border-line p-0.5 text-[11px] font-semibold uppercase tracking-[0.1em]">
              {(["pattern", "meaning"] as BrowserView[]).map((x) => (
                <button key={x} onClick={() => choose(x)} aria-pressed={view === x} className={`rounded px-2.5 py-1 transition-colors ${view === x ? "bg-surface text-foreground" : "text-faint hover:text-foreground"}`}>{x}</button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="text-[12px] text-muted hover:text-foreground">close <Kbd>esc</Kbd></button>
        </div>
        <input ref={inputRef} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search roots or meanings…" spellCheck={false} autoComplete="off"
          className="mt-3 w-full rounded-lg border border-line bg-background px-3 py-2 text-[15px] outline-none placeholder:text-faint focus:border-foreground" />

        {view === "pattern" ? (
          <div className="mt-5 space-y-6">
            {PATTERNS.map((p) => {
              const roots = p.roots.filter(match);
              if (!roots.length) return null;
              const ex = p.roots[0];
              return (
                <div key={p.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <div>
                      <span className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-foreground">{p.label}</span>
                      <span className="ml-2 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-faint">· {VOICE_LABEL[p.voice].name}</span>
                    </div>
                    <span className="text-[12px] text-faint">{p.sub.split(" · ")[1]} — <span className="tl text-muted">{ex.root}</span> <span className="mx-1">→</span><span className="text-[13px]"><PatternForm p={p} r={ex} /></span></span>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                    {roots.map((r) => (
                      <button key={p.id + r.root} onClick={() => onPick(r.root, p)} className={`flex items-baseline gap-2 rounded-lg px-3 py-1.5 text-left transition-colors ${r.root === current ? "bg-surface" : "hover:bg-surface/60"}`}>
                        <span className="tl w-[76px] shrink-0 text-[17px] font-medium text-muted">{r.root}</span>
                        <span className="text-faint">→</span>
                        <span className="text-[19px] leading-none"><PatternForm p={p} r={r} /></span>
                        <span className="ml-auto truncate pl-3 text-[12px] text-muted">{r.english}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-5 space-y-6">
            {CATEGORIES.map((c) => {
              const roots = c.roots.map(getLabRoot).filter((r): r is LabRoot => !!r && match(r));
              if (!roots.length) return null;
              return (
                <div key={c.id}>
                  <div className="text-[10.5px] font-semibold uppercase tracking-[0.12em] text-faint">{c.name}</div>
                  <div className="mt-2 grid grid-cols-2 gap-1 md:grid-cols-3">
                    {roots.map((r) => (
                      <button key={c.id + r.root} onClick={() => onPick(r.root, null)} className={`flex items-baseline justify-between rounded-lg px-3 py-2 text-left transition-colors ${r.root === current ? "bg-surface" : "hover:bg-surface/60"}`}>
                        <span className="tl text-[19px] font-medium" data-role="verb">{r.root}</span>
                        <span className="ml-3 truncate text-[12.5px] text-muted">{r.english}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
