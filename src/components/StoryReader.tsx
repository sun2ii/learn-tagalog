"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Story, StoryLine } from "@/content/stories";
import type { Token } from "@/content/types";
import { ROLE_LABEL } from "@/content/types";
import { Button, ExerciseBar, Eyebrow, Kbd, ProgressLine } from "./ui";
import { recordRepToday } from "@/lib/today";
import { shuffle } from "@/lib/exercises";
import { ChunkView } from "./ChunkView";
import { MorphologyView, hasMorphology } from "./Morphology";

/* Story reader: one line at a time, large; the previous and next lines faint.
   Tap a word for its role and meaning. Audio per line when the file exists.
   Keys: ↓ / space next · ↑ prev · e English · p play · a auto · c colors · f full text */

/** Split the spoken text so each token keeps its quotes and punctuation on screen. */
function segments(ln: StoryLine): { display: string; k: number }[] {
  const out: { display: string; k: number }[] = [];
  let pos = 0;
  ln.tokens.forEach((t, k) => {
    const at = ln.text.toLowerCase().indexOf(t.t.toLowerCase(), pos);
    if (at < 0) { out.push({ display: t.t, k }); return; }
    let end = at + t.t.length;
    while (end < ln.text.length && /[.,!?"”’)]/.test(ln.text[end])) end++;
    const lead = ln.text.slice(pos, at).replace(/\s+/g, "");
    out.push({ display: lead + ln.text.slice(at, end), k });
    pos = end;
  });
  return out;
}

/* One quiet row: the color key, in sentence order, always in view while reading. */
const ASPECT_TAG = { contemplated: "not yet · 0", ongoing: "ongoing · ½", completed: "done · 1" } as const;
const KEY: { role: string; word: string; name: string; aspect?: string }[] = [
  { role: "verb", word: "kakain", name: "action 0", aspect: "contemplated" }, { role: "verb", word: "kumakain", name: "½", aspect: "ongoing" }, { role: "verb", word: "kumain", name: "1", aspect: "completed" },
  { role: "actor", word: "ako", name: "who" }, { role: "particle", word: "ng", name: "marker" },
  { role: "object", word: "adobo", name: "what" }, { role: "describe", word: "masarap", name: "describe" }, { role: "time", word: "kahapon", name: "when" },
  { role: "negation", word: "hindi", name: "not" }, { role: "question", word: "bakit", name: "ask" },
];
function Cheatsheet({ dim }: { dim: boolean }) {
  return (
    <div className={`mx-auto flex max-w-3xl flex-wrap justify-center gap-x-5 gap-y-1 transition-opacity ${dim ? "opacity-40" : ""}`}>
      {KEY.map((k) => (
        <span key={k.role + (k.aspect ?? "")} data-role={k.role} data-aspect={k.aspect} className={`text-[11px] font-semibold uppercase tracking-[0.12em] ${k.aspect && k.aspect !== "contemplated" ? "-ml-3" : ""}`}>{k.name}</span>
      ))}
    </div>
  );
}

const ROLE_ATTR: Record<Token["role"], string> = { action: "verb", person: "actor", thing: "object", particle: "particle", question: "question", describe: "describe", time: "time" };

export function StoryReader({ story }: { story: Story }) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [english, setEnglish] = useState(true);
  const [colors, setColors] = useState(true);
  const [full, setFull] = useState(false);
  const [auto, setAuto] = useState(false);
  const [rate, setRate] = useState<1 | 0.8>(1);
  const [tok, setTok] = useState<number | null>(null);
  const [audioOk, setAudioOk] = useState<boolean | null>(null);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const [quiz, setQuiz] = useState(false);
  const [build, setBuild] = useState(false);
  const [chunks, setChunks] = useState(false);
  const [morphToken, setMorphToken] = useState<number | null>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const exit = "/library/stories/";
  const line = story.lines[i];

  const stop = useCallback(() => { audio.current?.pause(); audio.current = null; setPlaying(false); }, []);

  const play = useCallback((ln: StoryLine, then?: () => void) => {
    stop();
    const a = new Audio(`/audio/${ln.id}.mp3`);
    a.playbackRate = rate;
    a.onplay = () => { setPlaying(true); setAudioOk(true); };
    a.onended = () => { setPlaying(false); then?.(); };
    a.onerror = () => { setPlaying(false); setAudioOk(false); };
    audio.current = a;
    a.play().catch(() => { setPlaying(false); setAudioOk(false); });
  }, [rate, stop]);

  const go = useCallback((n: number) => {
    stop(); setTok(null); setChunks(false); setMorphToken(null);
    if (n >= story.lines.length) {
      if (story.quiz?.length) { setQuiz(true); return; }
      setDone(true);
      try { const r = JSON.parse(localStorage.getItem("tagalog.stories.v1") || "{}"); r[story.id] = (r[story.id] || 0) + 1; localStorage.setItem("tagalog.stories.v1", JSON.stringify(r)); } catch {}
      return;
    }
    setI(Math.max(0, n));
  }, [stop, story]);

  // Auto mode: play the line on arrival, advance when it ends.
  useEffect(() => {
    if (!auto || done || full) return;
    const t = setTimeout(() => play(line, () => setTimeout(() => go(i + 1), 650)), 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auto, i, done, full]);

  useEffect(() => () => stop(), [stop]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === "Escape") { stop(); router.push(exit); return; }
      if (done) { if (e.key === "Enter" || e.key === " ") router.push(exit); return; }
      if (quiz) return;
      if (build) { if (e.key === "b" || e.key === "Escape") setBuild(false); return; }
      if (e.key === "b") { stop(); setBuild(true); return; }
      if (full) { if (e.key === "f") setFull(false); if (e.key === "e") setEnglish((v) => !v); return; }
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === " " || e.key === "Enter") { e.preventDefault(); go(i + 1); }
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") { e.preventDefault(); go(i - 1); }
      else if (e.key === "e") setEnglish((v) => !v);
      else if (e.key === "c") setColors((v) => !v);
      else if (e.key === "p") play(line);
      else if (e.key === "a") setAuto((v) => !v);
      else if (e.key === "f") { stop(); setFull(true); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [i, done, full, quiz, build, line, go, play, stop, router]);

  if (quiz && story.quiz) {
    return <StoryQuiz story={story} onDone={() => { setQuiz(false); setDone(true); try { const r = JSON.parse(localStorage.getItem("tagalog.stories.v1") || "{}"); r[story.id] = (r[story.id] || 0) + 1; localStorage.setItem("tagalog.stories.v1", JSON.stringify(r)); } catch {} }} exit={() => router.push(exit)} />;
  }

  if (done) {
    return (
      <div className="flex min-h-[calc(100dvh-2rem)] flex-col items-center justify-center text-center animate-rise">
        <div className="eyebrow">{story.title}</div>
        <div className="tl mt-4 text-[44px] font-medium leading-none md:text-[56px]">Tapos na.</div>
        <div className="mt-3 text-muted">{story.lines.length} lines. Read it again with English hidden — that&rsquo;s the real test.</div>
        <div className="mt-12 flex gap-3">
          <Button variant="primary" onClick={() => router.push(exit)}>Done <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">↵</Kbd></Button>
          <Button onClick={() => { setDone(false); setI(0); setEnglish(false); }}>Again, no English</Button>
        </div>
      </div>
    );
  }

  const Controls = (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12.5px] text-muted">
      <button onClick={() => setEnglish((v) => !v)} className={`hover:text-foreground ${english ? "text-foreground" : ""}`}>English <Kbd>e</Kbd></button>
      <button onClick={() => setColors((v) => !v)} className={`hover:text-foreground ${colors ? "text-foreground" : ""}`}>Colors <Kbd>c</Kbd></button>
      <button onClick={() => { if (full) { setFull(false); } else { stop(); setFull(true); } }} className={`hover:text-foreground ${full ? "text-foreground" : ""}`}>Full text <Kbd>f</Kbd></button>
      {!full && <button onClick={() => setAuto((v) => !v)} className={`hover:text-foreground ${auto ? "text-foreground" : ""}`}>{auto ? "Auto-play on" : "Auto-play"} <Kbd>a</Kbd></button>}
      <button onClick={() => setRate((r) => (r === 1 ? 0.8 : 1))} className="tabular-nums hover:text-foreground">{rate === 1 ? "1×" : "0.8×"}</button>
      {audioOk === false && <span className="text-faint">no audio yet</span>}
    </div>
  );

  if (full) {
    return (
      <div className="flex min-h-[calc(100dvh-2rem)] flex-col">
        <ExerciseBar onClose={() => router.push(exit)} title={<span>{story.title} · <span className="text-faint">{story.titleEn}</span></span>} right="" />
        <div className="mx-auto mt-6 w-full max-w-3xl space-y-4">
          {story.lines.map((ln, k) => (
            <button key={ln.id} onClick={() => { setFull(false); setI(k); }} className="grid w-full items-baseline gap-x-8 text-left md:grid-cols-[minmax(0,1.4fr)_minmax(200px,1fr)]">
              <div className="tl text-[24px] font-medium leading-snug md:text-[27px]">{ln.text}</div>
              <div className={`text-[14px] leading-snug text-muted ${english ? "" : "invisible"}`}>{ln.gloss}</div>
            </button>
          ))}
        </div>
        <div className="mt-10">{Controls}</div>
      </div>
    );
  }

  const prev = story.lines[i - 1], next = story.lines[i + 1];

  return (
    <div className="flex min-h-[calc(100dvh-2rem)] flex-col">
      <ExerciseBar onClose={() => { stop(); router.push(exit); }} title={<span>{story.title} · <span className="text-faint">{story.titleEn}</span></span>} right={`${i + 1} / ${story.lines.length}`} />
      <ProgressLine value={(i / story.lines.length) * 100} className="mb-4" />
      <Cheatsheet dim={!colors} />

      {/* English on: two columns, line for line. English off: Tagalog alone, centered. */}
      <div className="flex flex-1 flex-col justify-center">
        <div className={`mx-auto grid w-full max-w-3xl items-center gap-x-10 gap-y-3 ${english ? "md:grid-cols-[minmax(0,1.5fr)_minmax(200px,1fr)]" : "justify-items-center text-center"}`}>
          <div className="tl min-h-[32px] text-[19px] leading-snug text-faint md:text-[21px]">{prev?.text ?? ""}</div>
          {english && <div className="hidden min-h-[32px] text-[14px] leading-snug text-faint/70 md:block">{prev?.gloss ?? ""}</div>}

          <div key={line.id} className={`tl flex flex-wrap gap-x-[0.28em] gap-y-1 py-3 text-[32px] font-medium leading-tight animate-rise-fast md:text-[38px] ${english ? "" : "justify-center md:text-[44px]"}`}>
            {segments(line).map(({ display, k }) => {
              const t = line.tokens[k];
              return (
                <span key={k} className="group relative">
                  <button onClick={() => setTok(tok === k ? null : k)} data-role={colors || tok === k ? ROLE_ATTR[t.role] : undefined} data-aspect={colors || tok === k ? t.aspect : undefined}
                    className={`rounded-md px-[0.06em] transition-colors hover:bg-surface ${tok === k ? "bg-surface" : ""}`}>
                    {display}
                  </button>
                  <span role="tooltip" className={`pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-60 -translate-x-1/2 rounded-lg border border-line bg-card p-3 text-left font-sans shadow-[0_8px_30px_-12px_rgba(0,0,0,0.35)] ${tok === k ? "block" : "hidden group-hover:block"}`}>
                    <span className="flex items-baseline justify-between gap-4">
                      <span className="tl text-[18px] font-medium" data-role={ROLE_ATTR[t.role]} data-aspect={t.aspect}>{t.t}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-faint">{ROLE_LABEL[t.role]}{t.aspect ? ` · ${ASPECT_TAG[t.aspect]}` : ""}</span>
                    </span>
                    <span className="mt-0.5 block text-[13.5px] leading-snug text-foreground">{t.m}</span>
                    {t.note && <span className="mt-1 block text-[12px] leading-snug text-muted">{t.note}</span>}
                  </span>
                </span>
              );
            })}
          </div>
          {english && <div key={`${line.id}-en`} className="py-1 text-[17px] leading-snug text-muted animate-fade md:text-[19px]">{line.gloss}</div>}

          <div className="tl min-h-[32px] text-[19px] leading-snug text-faint md:text-[21px]">{next?.text ?? ""}</div>
          {english && <div className="hidden min-h-[32px] text-[14px] leading-snug text-faint/70 md:block">{next?.gloss ?? ""}</div>}
        </div>
      </div>

      {build && <LineBuilder key={line.id} line={line} onClose={() => setBuild(false)} />}

      <div className="mt-8 flex items-center justify-center gap-3">
        <Button onClick={() => { stop(); setBuild((v) => !v); }} size="sm" className={build ? "!border-foreground" : ""}>Build <Kbd>b</Kbd></Button>
        <Button onClick={() => go(i - 1)} disabled={i === 0} size="sm" aria-label="Previous line">↑ <Kbd>↑</Kbd></Button>
        <Button onClick={() => (playing ? stop() : play(line))} size="md" className="min-w-28">{playing ? "Pause" : "Play line"} <Kbd>p</Kbd></Button>
        <Button variant="primary" onClick={() => go(i + 1)} size="sm">{i === story.lines.length - 1 ? "Finish" : "Next"} <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">↓</Kbd></Button>
      </div>
      <div className="mt-5">{Controls}</div>
    </div>
  );
}

/* ---------------- Build this line: reassemble the sentence from its own pieces ---------------- */
function LineBuilder({ line, onClose }: { line: StoryLine; onClose: () => void }) {
  const target = segments(line).map(({ display, k }) => ({ display, k }));
  const [bank, setBank] = useState(() => shuffle(target));
  const [placed, setPlaced] = useState<typeof target>([]);
  const [result, setResult] = useState<null | "ok" | "no">(null);
  const answered = useRef(false);

  const place = (p: { display: string; k: number }) => {
    if (result === "ok") return;
    const next = [...placed, p];
    setBank((b) => b.filter((x) => x.k !== p.k)); setPlaced(next); setResult(null);
    if (next.length === target.length) {
      const ok = next.every((x, idx) => x.k === target[idx].k);
      if (!answered.current) { answered.current = true; recordRepToday(ok, ok ? 1 : 0); }
      setResult(ok ? "ok" : "no");
    }
  };
  const unplace = (idx: number) => { if (result === "ok") return; setBank((b) => [...b, ...placed.slice(idx)]); setPlaced((s) => s.slice(0, idx)); setResult(null); };

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (/^[1-9]$/.test(e.key)) { const p = bank[Number(e.key) - 1]; if (p) { e.preventDefault(); place(p); } }
      else if (e.key === "Backspace" && placed.length) { e.preventDefault(); unplace(placed.length - 1); }
      else if ((e.key === "Enter" || e.key === " ") && result === "ok") { e.preventDefault(); onClose(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bank, placed, result]);

  return (
    <div className="mx-auto mt-6 w-full max-w-3xl rounded-xl border border-line p-5 animate-rise-fast">
      <div className="flex items-baseline justify-between">
        <Eyebrow>Build this line</Eyebrow>
        <span className="text-[12px] text-faint">{line.gloss}</span>
      </div>
      <div className={`mt-4 flex min-h-[48px] flex-wrap items-end gap-x-2 gap-y-2 ${result === "no" ? "animate-shake" : ""}`}>
        {placed.map((p, idx) => (
          <button key={p.k} onClick={() => unplace(idx)} className="flex flex-col items-center">
            <span data-role={result === "ok" ? ROLE_ATTR[line.tokens[p.k].role] : undefined} data-aspect={result === "ok" ? line.tokens[p.k].aspect : undefined}
              className={`tl rounded-md border px-2 py-0.5 text-[24px] font-medium leading-none ${result === "no" && p.k !== target[idx].k ? "border-err text-err" : result === "ok" ? "border-transparent" : "border-line-strong"}`}>{p.display}</span>
            {result === "ok" && <span className="mt-1.5 text-[9.5px] font-semibold uppercase tracking-[0.1em] text-faint">{ROLE_LABEL[line.tokens[p.k].role]}</span>}
          </button>
        ))}
        {placed.length < target.length && Array.from({ length: target.length - placed.length }).map((_, k) => <span key={k} className="mb-1.5 h-[3px] w-10 rounded-full bg-line" />)}
      </div>
      {result !== "ok" && (
        <div className="mt-4 flex flex-wrap gap-2">
          {bank.map((p, idx) => (
            <button key={p.k} onClick={() => place(p)} className="group relative rounded-md border border-line bg-card px-2.5 py-1 text-[20px] transition-[transform,border-color] hover:-translate-y-px hover:border-line-strong active:scale-95">
              <span className="tl font-medium leading-none">{p.display}</span>
              <Kbd className="absolute -right-1.5 -top-1.5 !h-4 !min-w-4 !text-[9px] opacity-0 group-hover:opacity-100">{idx + 1}</Kbd>
            </button>
          ))}
        </div>
      )}
      <div className="mt-4 flex items-center justify-between text-[12.5px]">
        <span className="text-faint"><Kbd>1</Kbd>–<Kbd>9</Kbd> pick · <Kbd>⌫</Kbd> undo</span>
        {result === "ok" ? <span className="font-semibold text-ok">Tama. <button onClick={onClose} className="ml-2 text-foreground underline">Back to reading</button></span>
          : result === "no" ? <span className="font-semibold text-err">Not that order — tap a piece to take it back.</span>
          : <button onClick={onClose} className="text-muted hover:text-foreground">Close</button>}
      </div>
    </div>
  );
}

/* ---------------- Quiz: three questions in Tagalog, tap to answer, 1–3 keys ---------------- */
function StoryQuiz({ story, onDone, exit }: { story: Story; onDone: () => void; exit: () => void }) {
  const qs = story.quiz!;
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const q = qs[i];
  const choose = (k: number) => {
    if (picked !== null) return;
    setPicked(k);
    const ok = k === q.answer;
    if (ok) setScore((s) => s + 1);
    recordRepToday(ok, ok ? 1 : 0);
  };
  const next = () => { if (i + 1 >= qs.length) { onDone(); return; } setI(i + 1); setPicked(null); };
  useEffect(() => {
    const armedAt = performance.now();
    const h = (e: KeyboardEvent) => {
      if (e.timeStamp <= armedAt) return;
      if (e.key === "Escape") { exit(); return; }
      if (picked === null && /^[1-4]$/.test(e.key)) { e.preventDefault(); choose(Number(e.key) - 1); }
      else if (picked !== null && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); next(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked, i]);
  return (
    <div className="flex min-h-[calc(100dvh-2rem)] flex-col">
      <ExerciseBar onClose={exit} title={<span>{story.title} · <span className="text-faint">check</span></span>} right={`${i + 1} / ${qs.length}`} />
      <ProgressLine value={(i / qs.length) * 100} className="mb-6" />
      <div key={i} className="flex flex-1 flex-col items-center justify-center text-center animate-rise-fast">
        <Eyebrow>Naintindihan mo ba?</Eyebrow>
        <div className="tl mt-4 max-w-2xl text-[32px] font-medium leading-tight md:text-[40px]">{q.q}</div>
        <div className="mt-10 flex flex-col gap-2.5">
          {q.options.map((o, k) => {
            const state = picked === null ? "" : k === q.answer ? "!border-ok !text-ok" : k === picked ? "!border-err !text-err" : "opacity-40";
            return (
              <Button key={k} size="lg" onClick={() => choose(k)} className={`tl min-w-72 justify-between !text-[20px] ${state}`}>
                <span>{o}</span><Kbd>{k + 1}</Kbd>
              </Button>
            );
          })}
        </div>
        <div className="mt-8 min-h-[44px]">
          {picked !== null && <Button variant="primary" onClick={next} className="animate-pop">{i + 1 >= qs.length ? `Done · ${score} / ${qs.length}` : "Next"} <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">⎵</Kbd></Button>}
        </div>
      </div>
    </div>
  );
}
