"use client";
import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Runner } from "@/components/Runner";
import { getWorkout, WORKOUTS } from "@/lib/exercises";

function Drill() {
  const sp = useSearchParams();
  const workout = getWorkout(sp.get("workout") || "actor") ?? WORKOUTS[0];
  const reps = Math.max(1, parseInt(sp.get("reps") || "25", 10) || 25);
  const next = useCallback(() => workout.next(), [workout]);
  const self = `/gym/drill/?workout=${workout.id}&reps=${reps}`;
  return <Runner title={workout.name} next={next} total={reps} exitHref="/gym/" againHref={self} mode="gym" />;
}

export default function DrillPage() {
  return <Suspense fallback={null}><Drill /></Suspense>;
}
