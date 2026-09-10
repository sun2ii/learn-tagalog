// Tagalog connectors: words that join clauses

export interface Connector {
  tagalog: string;
  english: string;
  position: "between" | "start"; // Where it typically appears
}

export const CONNECTORS: Record<string, Connector> = {
  at: { tagalog: "at", english: "and", position: "between" },
  pero: { tagalog: "pero", english: "but", position: "between" },
  kasi: { tagalog: "kasi", english: "because", position: "between" },
  kaya: { tagalog: "kaya", english: "so", position: "between" },
};

export const CONNECTOR_KEYS = ["at", "pero", "kasi", "kaya"] as const;
export type ConnectorKey = typeof CONNECTOR_KEYS[number];

export function getConnector(key: string): Connector | undefined {
  return CONNECTORS[key];
}
