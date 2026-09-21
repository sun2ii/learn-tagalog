"use client";
import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Runner } from "@/components/Runner";
import { nextVerbEx, type Family, type VerbDrill } from "@/lib/verbs";

const TITLE: Record<VerbDrill, string> = { build: "Verbs · Build the form", recognize: "Verbs · Recognize", conjugate: "Verbs · Conjugate", swap: "Verbs · Swap", mix: "Verbs" };

function Drill() {
  const sp = useSearchParams();
  const k = sp.get("kind"); const kind: VerbDrill = k === "build" || k === "recognize" || k === "conjugate" || k === "swap" ? k : "mix";
  const f = sp.get("family"); const family: Family | "all" = f === "um" || f === "mag" || f === "ma" || f === "in" ? f : "all";
  const reps = Math.max(1, parseInt(sp.get("reps") || "20", 10) || 20);
  const next = useCallback((i: number) => nextVerbEx(kind, family, i), [kind, family]);
  const self = `/verbs/drill/?kind=${kind}&family=${family}&reps=${reps}`;
  return <Runner title={TITLE[kind]} next={next} total={reps} exitHref="/verbs/" againHref={self} mode="gym" />;
}

export default function VerbsDrillPage() {
  return <Suspense fallback={null}><Drill /></Suspense>;
}
