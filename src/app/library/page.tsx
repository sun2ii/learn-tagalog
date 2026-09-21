"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { STORIES } from "@/content/stories";
import { ALL_VOCAB } from "@/content/vocab";
import { dueCards } from "@/lib/cards";
import { familiarSet } from "@/lib/familiar";
import { Eyebrow, Kbd, LinkButton } from "@/components/ui";

export default function LibraryPage() {
  const [due, setDue] = useState(0);
  const [known, setKnown] = useState(0);
  useEffect(() => { setDue(dueCards().length); setKnown([...familiarSet()].filter((k) => k.startsWith("vocab:")).length); }, []);
  const items = [
    { href: "/library/vocabulary/", name: "Vocabulary", blurb: "The words underneath the sentences, by role and frequency. Verbs carry their three forms.", status: `${known} / ${ALL_VOCAB.length} familiar` },
    { href: "/library/stories/", name: "Stories", blurb: "Short stories in the grammar you drill. Read line by line, tap any word, listen for the rhythm.", status: `${STORIES.length} stories` },
    { href: "/library/guide/", name: "Guide", blurb: "Why the app is shaped this way, how Tagalog works, where it came from, how people actually talk.", status: "read" },
    { href: "/map/", name: "System map", blurb: "The grammar skeleton on one screen: pronouns, particles, markers, question words, the verb engine.", status: "reference" },
  ];
  return (
    <div className="animate-rise">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Library</Eyebrow>
          <h1 className="mt-1.5 text-[28px] font-semibold leading-none tracking-tight">Take it in.</h1>
        </div>
        {due > 0 && <LinkButton href="/library/vocabulary/practice/?set=due" variant="primary" size="sm">Review {due} due <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">↵</Kbd></LinkButton>}
      </header>
      <ul className="mt-8 divide-y divide-line border-y border-line">
        {items.map((m) => (
          <li key={m.href}>
            <Link href={m.href} className="group flex items-center gap-6 py-5">
              <div className="min-w-0 flex-1">
                <div className="text-[19px] font-semibold tracking-tight">{m.name}</div>
                <div className="mt-0.5 max-w-xl text-[14px] text-muted">{m.blurb}</div>
              </div>
              <div className="hidden text-[12.5px] tabular-nums text-faint md:block">{m.status}</div>
              <svg className="text-faint transition-transform group-hover:translate-x-0.5" width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h8M7.5 3.5L11 7l-3.5 3.5" /></svg>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
