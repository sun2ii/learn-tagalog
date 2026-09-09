import { notFound } from "next/navigation";
import { lessons, getLesson } from "@/content";
import { LessonPlayer } from "@/components/LessonPlayer";

export function generateStaticParams() {
  return lessons.map((l) => ({ id: l.id }));
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();
  return <LessonPlayer lesson={lesson} />;
}
