// Tagalog time expressions
// These go at the end of the sentence (or occasionally at the start)

export interface TimeEntry {
  tagalog: string;
  english: string;
  position: "end" | "start" | "either";
  compatibleAspects: ("completed" | "ongoing" | "contemplated")[];
}

export const TIME_EXPRESSIONS: Record<string, TimeEntry> = {
  kahapon: {
    tagalog: "kahapon",
    english: "yesterday",
    position: "end",
    compatibleAspects: ["completed"],
  },
  ngayon: {
    tagalog: "ngayon",
    english: "now",
    position: "end",
    compatibleAspects: ["ongoing", "completed"], // "kumain ako ngayon" = I ate today/now
  },
  mamaya: {
    tagalog: "mamaya",
    english: "later",
    position: "end",
    compatibleAspects: ["contemplated"],
  },
  bukas: {
    tagalog: "bukas",
    english: "tomorrow",
    position: "end",
    compatibleAspects: ["contemplated"],
  },
};

export function getTimeTagalog(key: string): string {
  return TIME_EXPRESSIONS[key]?.tagalog ?? key;
}

export function getTimeEnglish(key: string): string {
  return TIME_EXPRESSIONS[key]?.english ?? key;
}

export function isTimeCompatible(timeKey: string, aspect: string): boolean {
  const entry = TIME_EXPRESSIONS[timeKey];
  if (!entry) return false;
  return entry.compatibleAspects.includes(aspect as "completed" | "ongoing" | "contemplated");
}

export const TIME_KEYS = Object.keys(TIME_EXPRESSIONS);
