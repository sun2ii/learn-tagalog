"use client";
import { useState } from "react";
import Link from "next/link";
import type { Exchange, Lesson, Line } from "@/content/types";
import { ColoredLine, Legend } from "./Token";
import { PlayButton } from "./Audio";
import { Speak } from "./Speak";
import { rate } from "@/lib/progress";

// The loop, per exchange:
//   listen → what's happening? → reveal (colored) → say your line → variation → rate → next
type Step = "listen" | "reveal" | "speak" | "variation" | "rate";
const ORDER: Step[] = ["listen", "reveal", "speak", "variation", "rate"];

export function LessonPlayer({ lesson, only }: { lesson: Lesson; only?: string[] }) {
  const exchanges = only ? lesson.exchanges.filter((e) => only.includes(e.id)) : lesson.exchanges;
  const [i, setI] = useState(0);
  const [step, setStep] = useState<Step>("listen");
  const [done, setDone] = useState(false);
  const ex = exchanges[i];

  function next() {
    const k = ORDER.indexOf(step);
    if (k < ORDER.length - 1) { setStep(ORDER[k + 1]); return; }
    if (i < exchanges.length - 1) { setI(i + 1); setStep("listen"); } else setDone(true);
  }

  if (!ex) return <p className="text-muted">Nothing to review right now. Come back later.</p>;

  if (done) return (
    <div className="space-y-4 pt-10 text-center">
      <div className="text-5xl">✓</div>
      <h2 className="text-2xl font-bold">Tapos na.</h2>
      <p className="text-muted">Finished. The pieces you missed come back in Review when they're due.</p>
      <div className="flex justify-center gap-3 pt-4">
        <Link href="/review/" className="rounded-full bg-foreground px-5 py-2 font-semibold text-background">Review</Link>
        <button onClick={() => { setI(0); setStep("listen"); setDone(false); }} className="rounded-full border border-line px-5 py-2 font-semibold">Again</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between text-xs text-muted">
        <span>{lesson.title} · {i + 1}/{exchanges.length}</span>
        <span className="flex gap-1">{ORDER.map((s) => <i key={s} className={`h-1.5 w-5 rounded-full ${ORDER.indexOf(s) <= ORDER.indexOf(step) ? "bg-foreground" : "bg-line"}`} />)}</span>
      </header>

      {step === "listen" && <Listen ex={ex} onNext={next} />}
      {step === "reveal" && <Reveal ex={ex} onNext={next} />}
      {step === "speak" && <SpeakStep ex={ex} onNext={next} />}
      {step === "variation" && <Variation ex={ex} onNext={next} />}
      {step === "rate" && <Rate ex={ex} onNext={next} />}
    </div>
  );
}

function Listen({ ex, onNext }: { ex: Exchange; onNext: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [plays, setPlays] = useState(0);
  return (
    <div className="space-y-5">
      <p className="rounded-xl bg-card border border-line p-3 text-sm text-muted">{ex.situation}</p>
      <div className="space-y-2">
        {ex.lines.map((ln) => (
          <div key={ln.id} className="flex items-center gap-3" onClick={() => setPlays((p) => p + 1)}>
            <span className="w-5 text-xs text-muted">{ln.speaker}</span>
            <PlayButton id={ln.id} label={ln.speaker === "A" ? "Them" : "You"} />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted">Listen first — no text yet. Play it a few times. Pick up the pieces you already know.</p>
      <div className="space-y-2">
        <p className="font-semibold">{ex.quiz.prompt}</p>
        {ex.quiz.options.map((o, k) => (
          <button key={k} onClick={() => setPicked(k)}
            className={`w-full rounded-xl border px-3 py-3 text-left ${picked === null ? "border-line" : k === ex.quiz.answer ? "border-describe bg-describe/10" : picked === k ? "border-action bg-action/10" : "border-line opacity-60"}`}>
            {o}
          </button>
        ))}
        {picked !== null && <p className="text-sm text-muted">Cue: {ex.quiz.why}</p>}
      </div>
      {(picked !== null || plays > 2) && <NextBtn onClick={onNext} label="Reveal" />}
    </div>
  );
}

function Reveal({ ex, onNext }: { ex: Exchange; onNext: () => void }) {
  return (
    <div className="space-y-5">
      <Legend />
      {ex.lines.map((ln) => (
        <div key={ln.id} className="rounded-xl border border-line bg-card p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-muted">{ln.speaker === "A" ? "Them" : "You"}</span>
            <PlayButton id={ln.id} label="Replay" />
          </div>
          <ColoredLine line={ln} />
        </div>
      ))}
      <p className="text-xs text-muted">Tap any piece to see what it's doing and where you already know it from.</p>
      <NextBtn onClick={onNext} label="Now say it" />
    </div>
  );
}

function SpeakStep({ ex, onNext }: { ex: Exchange; onNext: () => void }) {
  const mine: Line = ex.lines.find((l) => l.yours) ?? ex.lines[ex.lines.length - 1];
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">Your line. Hear it, then say it without reading.</p>
      <div className="rounded-xl border border-line bg-card p-3">
        <ColoredLine line={mine} />
        <div className="mt-3"><PlayButton id={mine.id} label="Hear native" /></div>
      </div>
      <Speak target={mine.text} />
      <NextBtn onClick={onNext} label="Variation" />
    </div>
  );
}

function Variation({ ex, onNext }: { ex: Exchange; onNext: () => void }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">Same pieces, new sentence. Listen — can you follow it before revealing?</p>
      <PlayButton id={ex.variation.id} autoplay label="Play variation" big />
      {!show ? (
        <button onClick={() => setShow(true)} className="w-full rounded-xl border border-line py-3 font-semibold">Reveal</button>
      ) : (
        <div className="rounded-xl border border-line bg-card p-3"><ColoredLine line={ex.variation} /></div>
      )}
      {show && <NextBtn onClick={onNext} label="Rate yourself" />}
    </div>
  );
}

function Rate({ ex, onNext }: { ex: Exchange; onNext: () => void }) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-line bg-card p-4">
        <div className="text-xs uppercase tracking-wide text-muted">Takeaway</div>
        <p className="mt-1 text-lg font-semibold whitespace-pre-line leading-snug">{ex.takeaway}</p>
      </div>
      <p className="text-sm text-muted">Could you follow the variation without the text?</p>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => { rate(ex.id, false); onNext(); }} className="rounded-xl border-2 border-action py-4 font-semibold text-action">Not yet</button>
        <button onClick={() => { rate(ex.id, true); onNext(); }} className="rounded-xl border-2 border-describe py-4 font-semibold text-describe">Got it</button>
      </div>
    </div>
  );
}

function NextBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return <button onClick={onClick} className="w-full rounded-xl bg-foreground py-4 text-lg font-semibold text-background">{label} →</button>;
}
