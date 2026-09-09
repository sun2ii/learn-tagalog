"use client";
// Speech recognition via the browser's Web Speech API (free, no key).
// Chrome/Safari/Edge support it; lang "fil-PH" gives rough Tagalog transcription —
// good enough for "was that close?", not for grading pronunciation.

export function hasRecognition(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
  return Boolean(w.SpeechRecognition || w.webkitSpeechRecognition);
}

export function listenOnce(lang = "fil-PH"): Promise<string> {
  return new Promise((resolve, reject) => {
    const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return reject(new Error("no-recognition"));
    const r = new Ctor();
    r.lang = lang; r.interimResults = false; r.maxAlternatives = 3;
    let done = false;
    r.onresult = (e) => { done = true; resolve(e.results[0][0].transcript); };
    r.onerror = (e) => { if (!done) reject(new Error(e.error)); };
    r.onend = () => { if (!done) resolve(""); };
    r.start();
  });
}

// Normalise and compare: how many target words showed up, in order.
export function similarity(target: string, heard: string): number {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-zñ\s-]/g, "").split(/\s+/).filter(Boolean);
  const t = norm(target), h = norm(heard);
  if (!t.length || !h.length) return 0;
  let i = 0, hits = 0;
  for (const w of t) { const j = h.indexOf(w, i); if (j >= 0) { hits++; i = j + 1; } }
  return hits / t.length;
}

interface SR {
  lang: string; interimResults: boolean; maxAlternatives: number;
  onresult: (e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void;
  onerror: (e: { error: string }) => void;
  onend: () => void;
  start(): void;
}
