"use client";
import { useState } from "react";
import { hasRecognition, listenOnce, similarity } from "@/lib/speech";

/** Say the line; the browser transcribes it (fil-PH); we show how close it was. */
export function Speak({ target }: { target: string }) {
  const [state, setState] = useState<"idle" | "listening" | "done" | "error">("idle");
  const [heard, setHeard] = useState("");
  const [score, setScore] = useState(0);
  const supported = typeof window !== "undefined" && hasRecognition();

  async function go() {
    setState("listening"); setHeard("");
    try {
      const h = await listenOnce();
      setHeard(h); setScore(similarity(target, h)); setState("done");
    } catch { setState("error"); }
  }

  if (!supported) return <p className="text-sm text-muted">Speech recognition isn't available in this browser — say it out loud anyway, then replay the native audio and compare.</p>;

  return (
    <div className="space-y-2">
      <button onClick={go} disabled={state === "listening"}
        className={`w-full rounded-xl border-2 py-4 text-lg font-semibold ${state === "listening" ? "border-action text-action animate-pulse" : "border-foreground"}`}>
        {state === "listening" ? "● Listening…" : "🎤 Say it"}
      </button>
      {state === "done" && (
        <div className="rounded-xl border border-line bg-card p-3 text-sm">
          <div className="text-muted">Heard:</div>
          <div className="text-base">{heard || "(nothing)"}</div>
          <div className="mt-1 font-semibold">{score >= 0.8 ? "✓ Close enough — that's the phrase." : score >= 0.4 ? "~ Partly there. Replay and try again." : "✗ Didn't catch it. Replay, listen for stress, try again."}</div>
        </div>
      )}
      {state === "error" && <p className="text-sm text-action">Mic error — allow microphone access and try again.</p>}
    </div>
  );
}
