export const queryKeys = {
  players: {
    all: (params?: object) => ["players", params ?? {}] as const,
    performance: ["players", "performance"] as const,
  },
  teams: {
    all: (params?: object) => ["teams", params ?? {}] as const,
  },
  matches: {
    all: (params?: object) => ["matches", params ?? {}] as const,
    detail: (id: string) => ["matches", id] as const,
  },
} as const;
