"use client";
import dynamic from "next/dynamic";

// Progress lives in localStorage, so the exercise renders on the client only and reads it at first render.
const Sentences = dynamic(() => import("@/components/Sentences").then((m) => m.Sentences), { ssr: false });

export default function SentencesPage() {
  return <Sentences />;
}
