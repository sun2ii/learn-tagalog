"use client";
import { useEffect, useState } from "react";
import { lessons } from "@/content";
import { LessonPlayer } from "@/components/LessonPlayer";
import { allCards, dueIds, resetProgress } from "@/lib/progress";

export default function ReviewPage() {
  const [due, setDue] = useState<string[] | null>(null);
  const [count, setCount] = useState(0);
  useEffect(() => { setDue(dueIds()); setCount(allCards().length); }, []);
  if (due === null) return null;
  const lesson = lessons[0];
  if (!due.length) return (
    <div className="space-y-4 pt-10 text-center">
      <h2 className="text-2xl font-bold">Wala pang due.</h2>
      <p className="text-muted">Nothing is due yet. {count ? `${count} exchanges tracked.` : "Finish a lesson first."}</p>
      <button onClick={() => { resetProgress(); setCount(0); }} className="text-xs text-muted underline">reset progress</button>
    </div>
  );
  return <LessonPlayer lesson={lesson} only={due} />;
}
