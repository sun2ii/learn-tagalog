"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Four core learning modes + home/menu
const items = [
  { href: "/everyday/", label: "Phrases", icon: "💬" },
  { href: "/gym/", label: "Gym", icon: "◎" },
  { href: "/builder/", label: "Build", icon: "⊞" },
  { href: "/questions/", label: "Ask", icon: "?" },
  { href: "/", label: "Menu", icon: "≡" },
];

export function Nav() {
  const p = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 border-t border-line bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-md flex">
        {items.map((it) => {
          const active = it.href === "/" ? p === "/" : p.startsWith(it.href.replace(/\/$/, ""));
          return (
            <Link key={it.href} href={it.href}
              className={`flex-1 py-2 text-center text-[11px] ${active ? "text-foreground font-semibold" : "text-muted"}`}>
              <div className="text-lg leading-5">{it.icon}</div>{it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
