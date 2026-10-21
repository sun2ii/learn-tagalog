"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getToday } from "@/lib/today";

/* Navigation is two levels:
     group  = an intent (what you want to do): Everyday, Grammar, Reading, Vocabulary, Guide.
     tab    = an engine inside that intent: Gym, Questions, Verbs, Particles, Builder, Deep End, Map.
   The sidebar and mobile bar show groups only. A hub tab row above the page shows the group's tabs.
   Routes are unchanged; this is only how they are reached. */

export interface NavTab { href: string; label: string }
export interface NavGroup { label: string; short: string; tabs: NavTab[] }

export const PRACTICE: NavGroup[] = [
  { label: "Everyday", short: "Everyday", tabs: [
    { href: "/everyday/", label: "Everyday" },
    { href: "/gym/", label: "Gym" },
    { href: "/questions/", label: "Questions" },
    { href: "/sentences/", label: "Sentences" },
  ] },
  { label: "Grammar", short: "Grammar", tabs: [
    { href: "/verbs/", label: "Verbs" },
    { href: "/particles/", label: "Particles" },
    { href: "/builder/", label: "Builder" },
  ] },
  { label: "Reading", short: "Reading", tabs: [
    { href: "/library/stories/", label: "Stories" },
    { href: "/deep-end/", label: "Deep End" },
  ] },
];
export const LIBRARY: NavGroup[] = [
  { label: "Vocabulary", short: "Vocab", tabs: [
    { href: "/library/vocabulary/", label: "Vocabulary" },
  ] },
  { label: "Guide", short: "Guide", tabs: [
    { href: "/library/guide/", label: "Guide" },
    { href: "/map/", label: "Map" },
  ] },
];
const GROUPS = [...PRACTICE, ...LIBRARY];

/* Routes where the learning content should own the whole screen. */
const FOCUS = ["/gym/drill", "/session", "/builder/play", "/questions/drill", "/verbs/drill", "/everyday/practice", "/library/vocabulary/practice", "/lesson", "/review"];

export function isFocusRoute(p: string) {
  if (/^\/library\/stories\/[^/]+/.test(p)) return true;
  return FOCUS.some((f) => p.startsWith(f));
}

const under = (p: string, href: string) => p.startsWith(href.replace(/\/$/, ""));
const groupHref = (g: NavGroup) => g.tabs[0].href;
const groupActive = (p: string, g: NavGroup) => g.tabs.some((t) => under(p, t.href));
const currentGroup = (p: string) => GROUPS.find((g) => groupActive(p, g));

export function Shell({ children }: { children: React.ReactNode }) {
  const p = usePathname();
  const focus = isFocusRoute(p);
  const group = focus ? undefined : currentGroup(p);
  return (
    <>
      {!focus && <Sidebar />}
      <div className={focus ? "" : "md:pl-52"}>
        <main className={`mx-auto w-full max-w-3xl px-5 md:px-8 ${focus ? "pt-[max(0.5rem,env(safe-area-inset-top))] pb-8" : "pt-6 pb-28 md:pt-8 md:pb-16"}`}>
          {group && group.tabs.length > 1 && <HubTabs group={group} p={p} />}
          {children}
        </main>
      </div>
      {!focus && <MobileNav />}
    </>
  );
}

/* Horizontal row of a group's engines, above the page. Only shown when the group has more than one. */
function HubTabs({ group, p }: { group: NavGroup; p: string }) {
  return (
    <nav aria-label={`${group.label} sections`} className="-mx-1 mb-7 flex gap-1 overflow-x-auto border-b border-line pb-px">
      {group.tabs.map((t) => {
        const active = under(p, t.href);
        return (
          <Link key={t.href} href={t.href}
            className={`-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-[13.5px] transition-colors ${active ? "border-foreground font-medium text-foreground" : "border-transparent text-muted hover:text-foreground"}`}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

function useMinutesToday() {
  const [m, setM] = useState<number | null>(null);
  useEffect(() => { setM(Math.round(getToday().ms / 60000)); }, []);
  return m;
}

/* Left sidebar on iPad / MacBook: wordmark, two groups, quiet today-count at the bottom. */
function Sidebar() {
  const p = usePathname();
  const m = useMinutesToday();
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-52 flex-col border-r border-line bg-background px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-5 md:flex">
      <Link href="/" className={`tl mb-8 px-2 text-[21px] font-semibold tracking-tight ${p === "/" ? "text-foreground" : "text-foreground/90 hover:text-foreground"}`}>Tagalog</Link>
      <SideGroup label="Practice" items={PRACTICE} p={p} />
      <SideGroup label="Library" items={LIBRARY} p={p} href="/library/" className="mt-7" />
      <div className="mt-auto px-2 text-[12px] tabular-nums text-faint">{m !== null && m > 0 ? `${m} min today` : ""}</div>
    </aside>
  );
}

function SideGroup({ label, items, p, href, className = "" }: { label: string; items: NavGroup[]; p: string; href?: string; className?: string }) {
  const sectionActive = items.some((g) => groupActive(p, g)) || (href ? p === href : false);
  const head = <span className={`text-[10.5px] font-semibold uppercase tracking-[0.14em] ${sectionActive ? "text-foreground" : "text-faint"}`}>{label}</span>;
  return (
    <div className={className}>
      <div className="mb-1.5 px-2">{href ? <Link href={href} className="hover:text-foreground">{head}</Link> : head}</div>
      <ul className="space-y-0.5">
        {items.map((g) => (
          <li key={g.label}>
            <Link href={groupHref(g)}
              className={`block rounded-lg px-2 py-1.5 text-[14px] transition-colors ${groupActive(p, g) ? "bg-surface font-medium text-foreground" : "text-muted hover:bg-surface/60 hover:text-foreground"}`}>
              {g.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MobileNav() {
  const p = usePathname();
  const items = [{ href: "/", short: "Home", active: p === "/" }, ...GROUPS.map((g) => ({ href: groupHref(g), short: g.short, active: groupActive(p, g) }))];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md">
        {items.map((it) => (
          <Link key={it.href} href={it.href}
            className={`flex-1 py-3 text-center text-[11px] tracking-wide ${it.active ? "font-semibold text-foreground" : "text-muted"}`}>
            {it.short}
          </Link>
        ))}
      </div>
    </nav>
  );
}
