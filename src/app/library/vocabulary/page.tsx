"use client";
import { useEffect, useMemo, useState } from "react";
import { VOCAB, vocabId } from "@/content/vocab";
import { Book, type BookGroup } from "@/components/Book";

const ROLE: Record<string, string> = { action: "verb", person: "actor", thing: "object", particle: "particle", question: "question", describe: "describe", time: "time" };

const TABS: { id: string; name: string; groups: string[]; blurb: string }[] = [
  { id: "verbs", name: "Verbs", groups: ["verbs-um", "verbs-mag", "verbs-ma", "verbs-in", "verbs-none"], blurb: "By family. Each root shows its three shades." },
  { id: "nouns", name: "Nouns", groups: ["food", "places", "people", "objects", "body-feelings"], blurb: "Things, places, people." },
  { id: "rest", name: "Everything else", groups: ["pronouns", "particles", "numbers-time", "adjectives"], blurb: "Pronouns, markers, particles, numbers, time, describing." },
];

export default function VocabularyPage() {
  const [tab, setTab] = useState("verbs");
  useEffect(() => { try { const t = localStorage.getItem("tagalog.vocab.tab"); if (t && TABS.some((x) => x.id === t)) setTab(t); } catch {} }, []);
  const pickTab = (id: string) => { setTab(id); try { localStorage.setItem("tagalog.vocab.tab", id); } catch {} };
  const current = TABS.find((t) => t.id === tab) ?? TABS[0];
  const all = useMemo<BookGroup[]>(() => VOCAB.map((g) => ({
    id: g.id, name: g.name, scene: g.scene,
    items: g.words.map((w) => ({
      id: vocabId(w), role: ROLE[w.role], sub: w.m,
      main: w.forms ? (
        <span>{w.t} <span className="text-faint">→</span> {(["contemplated", "ongoing", "completed"] as const).map((a, i) => (
          <span key={a}><span data-aspect={a}>{w.forms![i]}</span>{i < 2 ? <span className="text-faint"> · </span> : null}</span>
        ))}</span>
      ) : w.t,
      details: (w.forms || w.ex || w.note || w.anchor) ? (
        <>
          {w.forms && (
            <div className="flex flex-wrap gap-x-5 gap-y-1">
              {(["not yet", "ongoing", "done"] as const).map((l, i) => (
                <span key={l}><span className="eyebrow mr-1.5 !text-[10px]">{l}</span><span className="tl text-[16px]" data-aspect={(["contemplated", "ongoing", "completed"] as const)[i]}>{w.forms![i]}</span></span>
              ))}
            </div>
          )}
          {w.ex && <div><span className="tl text-[16px] text-foreground">{w.ex}</span>{w.exEn && <span className="ml-2">{w.exEn}</span>}</div>}
          {w.note && <div>{w.note}</div>}
          {w.anchor && <div><span className="eyebrow mr-2 !text-[10px]">{w.anchor.lang === "id" ? "indonesian" : "spanish"}</span>{w.anchor.word}{w.anchor.note ? ` — ${w.anchor.note}` : ""}</div>}
        </>
      ) : undefined,
    })),
  })), []);
  const groups = useMemo(() => current.groups.map((id) => all.find((g) => g.id === id)).filter((g): g is BookGroup => !!g), [all, current]);
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => pickTab(t.id)} className={`rounded-lg px-3 py-1.5 text-[14px] transition-colors ${tab === t.id ? "bg-foreground font-medium text-background" : "text-muted hover:bg-surface hover:text-foreground"}`}>{t.name}</button>
        ))}
        <span className="ml-2 text-[12.5px] text-faint">{current.blurb}</span>
      </div>
      <Book key={tab} eyebrow={`Vocabulary · ${current.name}`} title="The words underneath." groups={groups} practiceBase="/library/vocabulary/practice/" storageKey={`tagalog.vocab.group.${tab}`} exit="/library/" />
    </div>
  );
}
