export const queryKeys = {
  players: {
    all: ["players"] as const,
    performance: ["players", "performance"] as const,
  },
  teams: {
    all: ["teams"] as const,
  },
  matches: {
    all: (size?: string) => ["matches", size ?? "5"] as const,
    detail: (id: string) => ["matches", id] as const,
  },
} as const;
