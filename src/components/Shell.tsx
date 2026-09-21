"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getToday } from "@/lib/today";

export const MODES = [
  { href: "/everyday/", label: "Everyday", short: "Everyday" },
  { href: "/gym/", label: "Gym", short: "Gym" },
  { href: "/builder/", label: "Builder", short: "Builder" },
  { href: "/questions/", label: "Questions", short: "Questions" },
  { href: "/verbs/", label: "Verbs", short: "Verbs" },
  { href: "/particles/", label: "Particles", short: "Particles" },
  { href: "/deep-end/", label: "Deep End", short: "Deep" },
];
export const LIBRARY = [
  { href: "/library/vocabulary/", label: "Vocabulary" },
  { href: "/library/stories/", label: "Stories" },
  { href: "/library/guide/", label: "Guide" },
  { href: "/map/", label: "Map" },
];

/* Routes where the learning content should own the whole screen. */
const FOCUS = ["/gym/drill", "/session", "/builder/play", "/questions/drill", "/verbs/drill", "/everyday/practice", "/library/vocabulary/practice", "/lesson", "/review"];

export function isFocusRoute(p: string) {
  if (/^\/library\/stories\/[^/]+/.test(p)) return true;
  return FOCUS.some((f) => p.startsWith(f));
}

export function Shell({ children }: { children: React.ReactNode }) {
  const p = usePathname();
  const focus = isFocusRoute(p);
  return (
    <>
      {!focus && <Sidebar />}
      <div className={focus ? "" : "md:pl-52"}>
        <main className={`mx-auto w-full max-w-3xl px-5 md:px-8 ${focus ? "pt-[max(0.5rem,env(safe-area-inset-top))] pb-8" : "pt-6 pb-28 md:pt-8 md:pb-16"}`}>
          {children}
        </main>
      </div>
      {!focus && <MobileNav />}
    </>
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
      <SideGroup label="Practice" items={MODES} p={p} />
      <SideGroup label="Library" items={LIBRARY} p={p} href="/library/" className="mt-7" />
      <div className="mt-auto px-2 text-[12px] tabular-nums text-faint">{m !== null && m > 0 ? `${m} min today` : ""}</div>
    </aside>
  );
}

function SideGroup({ label, items, p, href, className = "" }: { label: string; items: { href: string; label: string }[]; p: string; href?: string; className?: string }) {
  const active = (h: string) => p.startsWith(h.replace(/\/$/, ""));
  const groupActive = items.some((it) => active(it.href)) || (href ? p === href : false);
  const head = <span className={`text-[10.5px] font-semibold uppercase tracking-[0.14em] ${groupActive ? "text-foreground" : "text-faint"}`}>{label}</span>;
  return (
    <div className={className}>
      <div className="mb-1.5 px-2">{href ? <Link href={href} className="hover:text-foreground">{head}</Link> : head}</div>
      <ul className="space-y-0.5">
        {items.map((it) => (
          <li key={it.href}>
            <Link href={it.href}
              className={`block rounded-lg px-2 py-1.5 text-[14px] transition-colors ${active(it.href) ? "bg-surface font-medium text-foreground" : "text-muted hover:bg-surface/60 hover:text-foreground"}`}>
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MobileNav() {
  const p = usePathname();
  const items = [{ href: "/", label: "Home", short: "Home" }, ...MODES, { href: "/library/", label: "Library", short: "Library" }];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md">
        {items.map((it) => {
          const active = it.href === "/" ? p === "/" : p.startsWith(it.href.replace(/\/$/, ""));
          return (
            <Link key={it.href} href={it.href}
              className={`flex-1 py-3 text-center text-[11px] tracking-wide ${active ? "font-semibold text-foreground" : "text-muted"}`}>
              {it.short}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
