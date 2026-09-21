"use client";
import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Runner } from "@/components/Runner";
import { nextQuestion, type QuestionDrillKind } from "@/lib/exercises";

const TITLE: Record<QuestionDrillKind, string> = { yesno: "Yes / no questions", wh: "Question words", mixed: "Questions" };

function Drill() {
  const sp = useSearchParams();
  const k = sp.get("kind");
  const kind: QuestionDrillKind = k === "yesno" || k === "wh" ? k : "mixed";
  const reps = Math.max(1, parseInt(sp.get("reps") || "20", 10) || 20);
  const next = useCallback(() => nextQuestion(kind), [kind]);
  const self = `/questions/drill/?kind=${kind}&reps=${reps}`;
  return <Runner title={TITLE[kind]} next={next} total={reps} exitHref="/questions/" againHref={self} mode="questions" />;
}

export default function QuestionsDrillPage() {
  return <Suspense fallback={null}><Drill /></Suspense>;
}
