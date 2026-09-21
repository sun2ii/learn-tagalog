"use client";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { familiarSet, toggleFamiliar } from "@/lib/familiar";
import { getDueCardIds } from "@/lib/learner";
import { EnterToStart, Eyebrow, Kbd, LinkButton } from "./ui";

/* Book: a browsable set of groups (situations, word families) with one group on
   screen at a time, ✓ familiar, hide-English, and a practice entry point.
   Everyday and Vocabulary are both Books with different items. */

export interface BookItem {
  id: string;          // SRS + familiar key
  main: ReactNode;     // Tagalog
  sub: string;         // English
  role?: string;       // data-role coloring for the headword
  details?: ReactNode; // expanded: forms, note, example, anchor
}
export interface BookGroup { id: string; name: string; scene: string; items: BookItem[] }

export function Book({ eyebrow, title, groups, practiceBase, storageKey, exit }: {
  eyebrow: string; title: string; groups: BookGroup[]; practiceBase: string; storageKey: string; exit?: string;
}) {
  const [familiar, setFamiliar] = useState<Set<string>>(new Set());
  const [due, setDue] = useState(0);
  const [hideEnglish, setHideEnglish] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [active, setActive] = useState<string>(groups[0].id);

  useEffect(() => {
    setFamiliar(familiarSet());
    try { const a = localStorage.getItem(storageKey); if (a && groups.some((g) => g.id === a)) setActive(a); } catch {}
    const ids = new Set(getDueCardIds());
    setDue(groups.flatMap((g) => g.items).filter((p) => ids.has(p.id)).length);
  }, [groups, storageKey]);

  const total = useMemo(() => groups.reduce((n, g) => n + g.items.length, 0), [groups]);
  const gi = groups.findIndex((g) => g.id === active);
  const group = groups[gi] ?? groups[0];
  const prev = groups[gi - 1], next = groups[gi + 1];
  const pick = (id: string) => { setActive(id); setOpen(null); try { localStorage.setItem(storageKey, id); } catch {} };
  const known = group.items.filter((p) => familiar.has(p.id)).length;
  const dueHref = `${practiceBase}?set=due`;

  return (
    <div className="animate-rise">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>{exit ? <Link href={exit} className="hover:text-foreground">Library</Link> : null}{exit ? " · " : ""}{eyebrow}</Eyebrow>
          <h1 className="mt-1.5 text-[28px] font-semibold leading-none tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="mr-2 text-[12.5px] tabular-nums text-muted">{familiar.size} / {total} familiar</span>
          {due > 0 && <LinkButton href={dueHref} variant="primary" size="sm">Review {due} due <Kbd className="!bg-white/15 !border-white/25 !text-accent-fg">↵</Kbd></LinkButton>}
          <LinkButton href={`${practiceBase}?set=all`} variant={due > 0 ? "secondary" : "primary"} size="sm">Practice all</LinkButton>
        </div>
      </header>

      <nav className="sticky top-0 z-10 -mx-5 mt-6 overflow-x-auto border-b border-line bg-background/90 px-5 py-2 backdrop-blur md:top-0 md:-mx-8 md:px-8">
        <div className="flex items-center gap-1 whitespace-nowrap">
          {groups.map((g) => (
            <button key={g.id} onClick={() => pick(g.id)}
              className={`rounded-md px-2.5 py-1 text-[12.5px] transition-colors ${active === g.id ? "bg-foreground text-background" : "text-muted hover:bg-surface hover:text-foreground"}`}>
              {g.name}
            </button>
          ))}
        </div>
      </nav>

      <section key={group.id} className="mt-5 animate-rise-fast">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-[21px] font-semibold tracking-tight">{group.name}</h2>
            <p className="text-[13.5px] text-muted">{group.scene}</p>
          </div>
          <div className="flex items-center gap-4 text-[12.5px] text-muted">
            <button onClick={() => setHideEnglish((h) => !h)} className="hover:text-foreground">{hideEnglish ? "Show English" : "Hide English"}</button>
            <span className="tabular-nums">{known}/{group.items.length}</span>
            <Link href={`${practiceBase}?set=${group.id}`} className="font-medium text-foreground hover:underline">Practice →</Link>
          </div>
        </div>
        <ul className="mt-3 divide-y divide-line border-y border-line">
          {group.items.map((p) => (
            <Row key={p.id} p={p} familiar={familiar.has(p.id)} hideEnglish={hideEnglish}
              open={open === p.id} onOpen={() => setOpen(open === p.id ? null : p.id)}
              onToggle={() => setFamiliar(new Set(toggleFamiliar(p.id)))} />
          ))}
        </ul>
        <div className="mt-6 flex justify-between text-[13px]">
          <button disabled={!prev} onClick={() => prev && pick(prev.id)} className="text-muted hover:text-foreground disabled:opacity-0">← {prev?.name}</button>
          <button disabled={!next} onClick={() => next && pick(next.id)} className="text-muted hover:text-foreground disabled:opacity-0">{next?.name} →</button>
        </div>
      </section>
      <EnterToStart href={due > 0 ? dueHref : null} />
    </div>
  );
}

function Row({ p, familiar, hideEnglish, open, onOpen, onToggle }: { p: BookItem; familiar: boolean; hideEnglish: boolean; open: boolean; onOpen: () => void; onToggle: () => void }) {
  const [peek, setPeek] = useState(false);
  const showEn = !hideEnglish || peek || open;
  return (
    <li>
      <div className="flex items-center gap-4 py-3">
        <button onClick={hideEnglish ? () => setPeek((x) => !x) : onOpen} className="min-w-0 flex-1 text-left">
          <div data-role={p.role} className={`tl text-[22px] font-medium leading-tight md:text-[24px] ${familiar ? "opacity-60" : ""}`}>{p.main}</div>
          <div className={`mt-0.5 text-[13.5px] text-muted transition-opacity ${showEn ? "opacity-100" : "opacity-0 select-none"}`}>{p.sub}</div>
        </button>
        {p.details && (
          <button onClick={onOpen} aria-label="Details" className={`hidden h-8 w-8 items-center justify-center rounded-md text-faint hover:bg-surface hover:text-foreground md:flex ${open ? "text-foreground" : ""}`}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d={open ? "M3 7h8" : "M7 3v8M3 7h8"} /></svg>
          </button>
        )}
        <button onClick={onToggle} aria-label={familiar ? "Unmark familiar" : "Mark familiar"} aria-pressed={familiar}
          className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${familiar ? "border-ok bg-ok text-background" : "border-line text-faint hover:border-foreground/60 hover:text-foreground"}`}>
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.5l3 3 6-7" /></svg>
        </button>
      </div>
      {open && p.details && <div className="-mt-1 mb-4 space-y-1.5 text-[13.5px] text-muted animate-fade">{p.details}</div>}
    </li>
  );
}
