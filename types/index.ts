import type { Match, Player, Team } from "@prisma/client";

export type EventType = "0" | "1" | "2" | "4" | "6" | "-1" | "-2" | "-3";

export type IPLayer = Player;

export type ITeam = Team;

export type IMatch = Match;
