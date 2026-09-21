"use client";
import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Runner } from "@/components/Runner";
import { nextBuild } from "@/lib/exercises";

function Play() {
  const sp = useSearchParams();
  const level = sp.get("level") === "simple" ? "simple" : "full";
  const reps = Math.max(1, parseInt(sp.get("reps") || "15", 10) || 15);
  const next = useCallback(() => nextBuild(level), [level]);
  const self = `/builder/play/?level=${level}&reps=${reps}`;
  return <Runner title={level === "simple" ? "Builder · simple" : "Builder"} next={next} total={reps} exitHref="/builder/" againHref={self} mode="builder" />;
}

export default function PlayPage() {
  return <Suspense fallback={null}><Play /></Suspense>;
}
