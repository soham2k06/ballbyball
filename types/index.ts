import { BallEvent, Match, Player, Team } from "@prisma/client";
import { Dispatch, SetStateAction } from "react";

type EventType =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "6"
  | "-1"
  | "-2"
  | "-3"
  | "-4"
  | "-5";

type OverlayStateProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
};

type PlayerScore = {
  runs: number;
  totalBalls: number;
  wickets: number;
  runRate: number;
  extras: number;
};

type PlayerPerformance = {
  playerId: string;
  runsScored: number;
  ballsFaced: number;
  runConceded: number;
  ballsBowled: number;
  wicketsTaken: number;
  team: string;
  isWinner: boolean;
};

type PlayerStats = {
  batting: {
    runs: number;
    balls: number;
    wickets: number;
    fifties: number;
    centuries: number;
    highestScore: number;
    isNotoutOnHighestScore: boolean;
  };
  bowling: {
    runs: number;
    balls: number;
    wickets: number;
    maidenOvers: number;
  };
  matchesPlayed: number;
};

type PlayerMatches = {
  id: string;
  name: string;
  batScore: PlayerScore & { isNotout: boolean };
  bowlScore: PlayerScore;
  hasPlayerWon: boolean;
  winInfo: string;
  createdAt: Date;
};

type TopPerformant = PlayerPerformance & {
  type: "batsman" | "bowler";
  name: string;
};

// ** Schema relations types

type TeamWithPlayers = Team & { players: Player[] };

type MatchExtended = Match & {
  teams: (TeamWithPlayers & { playerIds: string[] })[];
  ballEvents: BallEvent[];
};

export type {
  EventType,
  OverlayStateProps,
  PlayerPerformance,
  PlayerStats,
  TeamWithPlayers,
  MatchExtended,
  PlayerMatches,
  PlayerScore,
  TopPerformant,
};
