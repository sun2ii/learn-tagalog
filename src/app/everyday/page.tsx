"use client";
import { useMemo } from "react";
import { EVERYDAY_PHRASES, phraseId } from "@/content/everyday";
import { Book, type BookGroup } from "@/components/Book";

export default function EverydayPage() {
  const groups = useMemo<BookGroup[]>(() => EVERYDAY_PHRASES.map((g) => ({
    id: g.id, name: g.name, scene: g.scene,
    items: g.phrases.map((p) => ({
      id: phraseId(p), main: p.tagalog, sub: p.english,
      details: (p.note || p.formal || p.indonesian) ? (
        <>
          {p.formal && <div><span className="eyebrow mr-2 !text-[10px]">polite</span><span className="tl text-[16px] text-foreground">{p.formal}</span></div>}
          {p.note && <div>{p.note}</div>}
          {p.indonesian && <div><span className="eyebrow mr-2 !text-[10px]">indonesian</span>{p.indonesian}</div>}
        </>
      ) : undefined,
    })),
  })), []);
  return <Book eyebrow="Everyday" title="Say it when you land." groups={groups} practiceBase="/everyday/practice/" storageKey="tagalog.everyday.group" />;
}
