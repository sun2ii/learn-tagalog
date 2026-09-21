"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { STORIES } from "@/content/stories";
import { Eyebrow } from "@/components/ui";

const LEVEL_NOTE: Record<number, string> = { 1: "Statements — present and past. Kumain ako. Pumunta sila.", 2: "Questions, negation, and the future. Kailan ka dumating? Hindi pa.", 3: "Object focus and longer dialogue. Kinain nila ang adobo.", 4: "Longer sentences, connectors, narrative past. Habang umuulan, nagluto si Tito." };

export default function StoriesPage() {
  const [reads, setReads] = useState<Record<string, number>>({});
  useEffect(() => { try { setReads(JSON.parse(localStorage.getItem("tagalog.stories.v1") || "{}")); } catch {} }, []);
  return (
    <div className="animate-rise">
      <header>
        <Eyebrow><Link href="/library/" className="hover:text-foreground">Library</Link> · Stories</Eyebrow>
        <h1 className="mt-1.5 text-[28px] font-semibold leading-none tracking-tight">Hear the rhythm.</h1>
        <p className="mt-2 max-w-xl text-[14.5px] text-muted">Short stories in the grammar you drill, in a ladder: each one leans on the last and adds a few words (listed under each). Hover any word; press <kbd className="rounded border border-line px-1 text-[12px]">b</kbd> on any line to rebuild it; three questions at the end.</p>
      </header>
      {([1, 2, 3, 4] as const).map((lvl) => {
        const list = STORIES.filter((s) => s.level === lvl);
        if (!list.length) return null;
        return (
          <details key={lvl} open={lvl === 1} className="group mt-2 border-t border-line first-of-type:border-t-0">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
              <div>
                <div className="text-[22px] font-semibold tracking-tight md:text-[24px]">Level {lvl} <span className="ml-2 text-[15px] font-normal text-faint">{list.length} {list.length === 1 ? "story" : "stories"}</span></div>
                <div className="mt-0.5 text-[15px] text-muted">{LEVEL_NOTE[lvl]}</div>
              </div>
              <svg className="shrink-0 text-faint transition-transform duration-200 group-open:rotate-90" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3l5 5-5 5" /></svg>
            </summary>
            <ul className="mb-6 divide-y divide-line border-y border-line animate-fade">
              {list.map((s) => (
                <li key={s.id}>
                  <Link href={`/library/stories/${s.id}/`} className="group flex items-center gap-6 py-5">
                    <div className="min-w-0 flex-1">
                      <div className="tl text-[24px] font-medium leading-tight">{s.title}</div>
                      <div className="text-[13.5px] text-muted">{s.titleEn} · {s.lines.length} lines</div>
                      <div className="mt-1.5 text-[14px] text-muted">{s.blurb}</div>
                      {s.newWords && <div className="tl mt-2 text-[14px] text-faint">+ {s.newWords.join(" · ")}</div>}
                    </div>
                    <div className="hidden text-[12.5px] tabular-nums text-faint md:block">{reads[s.id] ? `read ${reads[s.id]}×` : ""}</div>
                    <svg className="text-faint transition-transform group-hover:translate-x-0.5" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" /></svg>
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        );
      })}
      <p className="mt-6 text-[12.5px] text-faint">Audio: run <code className="rounded bg-surface px-1">npx tsx scripts/export-lines.ts &gt; scripts/lines.json &amp;&amp; python3 scripts/gen-audio.py</code> once, then every line plays offline.</p>
    </div>
  );
}
