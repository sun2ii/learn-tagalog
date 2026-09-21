import { notFound } from "next/navigation";
import { STORIES, getStory } from "@/content/stories";
import { StoryReader } from "@/components/StoryReader";

export function generateStaticParams() {
  return STORIES.map((s) => ({ id: s.id }));
}

export default async function StoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const story = getStory(id);
  if (!story) notFound();
  return <StoryReader story={story} />;
}
