"use client";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Runner } from "@/components/Runner";
import { makeSession } from "@/lib/exercises";
import { dueCards } from "@/lib/cards";

/* A session rotates Gym → Builder → Questions until the clock runs out.
   min=0 is free study: it ends when you press Escape. */
function Session() {
  const sp = useSearchParams();
  const min = Math.max(0, parseInt(sp.get("min") || "10", 10) || 0);
  const title = min ? `${min}-minute session` : "Free study";
  const next = useMemo(() => makeSession(dueCards()), []);
  return <Runner title={title} next={next} minutes={min || undefined} exitHref="/" againHref={`/session/?min=${min}`} />;
}

export default function SessionPage() {
  return <Suspense fallback={null}><Session /></Suspense>;
}
