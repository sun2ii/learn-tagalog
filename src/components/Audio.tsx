"use client";
import { useEffect, useRef, useState } from "react";

/** Plays /audio/<id>.mp3. Optionally autoplays on mount (after a user gesture has happened). */
export function PlayButton({ id, autoplay = false, label = "Listen", big = false }: { id: string; autoplay?: boolean; label?: string; big?: boolean }) {
  const ref = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const a = new Audio(`/audio/${id}.mp3`);
    a.onplay = () => setPlaying(true); a.onended = () => setPlaying(false); a.onpause = () => setPlaying(false);
    ref.current = a;
    if (autoplay) a.play().catch(() => {});
    return () => { a.pause(); };
  }, [id, autoplay]);
  return (
    <button onClick={() => { const a = ref.current; if (!a) return; a.currentTime = 0; a.play().catch(() => {}); }}
      className={`inline-flex items-center gap-2 rounded-full bg-foreground text-background font-semibold ${big ? "px-6 py-4 text-lg" : "px-4 py-2 text-sm"} ${playing ? "opacity-70" : ""}`}>
      <span>{playing ? "◉" : "▶"}</span>{label}
    </button>
  );
}
