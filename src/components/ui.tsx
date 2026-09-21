"use client";
import Link from "next/link";
import { useEffect, type ReactNode, type ButtonHTMLAttributes } from "react";

/* Small, boring primitives. Everything visual that repeats lives here. */

type Variant = "primary" | "secondary" | "ghost" | "quiet";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium select-none transition-[transform,background-color,border-color,opacity] duration-150 active:scale-[0.985] disabled:opacity-40 disabled:active:scale-100";
const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-fg hover:opacity-90",
  secondary: "border border-line-strong bg-card text-foreground hover:border-foreground/50",
  ghost: "text-foreground hover:bg-surface",
  quiet: "text-muted hover:text-foreground",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] rounded-lg",
  md: "h-11 px-5 text-[15px] rounded-xl",
  lg: "h-13 px-7 text-[17px] rounded-xl",
};

export function Button({
  variant = "secondary", size = "md", className = "", children, ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button type="button" className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function LinkButton({
  href, variant = "secondary", size = "md", className = "", children,
}: { href: string; variant?: Variant; size?: Size; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </Link>
  );
}

/** Keyboard hint. Renders nothing on touch-only devices. */
export function Kbd({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <kbd className={`hidden md:inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] border border-line-strong bg-surface px-1.5 font-sans text-[10.5px] font-semibold text-muted ${className}`}>
      {children}
    </kbd>
  );
}

export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`eyebrow ${className}`}>{children}</div>;
}

/** Thin progress line – the only progress bar in the app. */
export function ProgressLine({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`h-[3px] w-full overflow-hidden rounded-full bg-line ${className}`} aria-hidden>
      <div className="h-full rounded-full bg-foreground transition-[width] duration-500 ease-out" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

export function Stat({ value, label, tone }: { value: ReactNode; label: string; tone?: "ok" | "err" | "muted" }) {
  const c = tone === "ok" ? "text-ok" : tone === "err" ? "text-err" : "text-foreground";
  return (
    <div>
      <div className={`text-[28px] font-semibold leading-none tracking-tight tabular-nums ${c}`}>{value}</div>
      <div className="mt-1.5 text-[12px] text-muted">{label}</div>
    </div>
  );
}

/** Header used by every full-screen exercise: close, title, right slot. */
export function ExerciseBar({ onClose, title, right }: { onClose: () => void; title: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex h-12 items-center justify-between">
      <button onClick={onClose} aria-label="Exit" className="-ml-2 flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-foreground">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 3l10 10M13 3L3 13" /></svg>
      </button>
      <div className="text-[13px] font-medium text-muted">{title}</div>
      <div className="min-w-9 text-right text-[13px] tabular-nums text-muted">{right}</div>
    </div>
  );
}

export function Divider({ className = "" }: { className?: string }) {
  return <hr className={`border-0 border-t border-line ${className}`} />;
}

/** Enter on a hub starts the recommended thing. Ignored while typing. */
export function EnterToStart({ href }: { href: string | null }) {
  useEffect(() => {
    if (!href) return;
    const h = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLButtonElement || e.target instanceof HTMLAnchorElement) return;
      window.location.href = href;
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [href]);
  return null;
}
