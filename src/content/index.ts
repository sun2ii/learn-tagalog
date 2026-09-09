import { lesson1 } from "./lesson1";
import type { Lesson } from "./types";
export const lessons: Lesson[] = [lesson1];
export const getLesson = (id: string) => lessons.find((l) => l.id === id);
