import { BallEvent, Match, Player, Team, TeamPlayer } from "@prisma/client";
import { Dispatch, SetStateAction } from "react";

type EventType = "0" | "1" | "2" | "3" | "4" | "6" | "-1" | "-2" | "-3" | "-4";

type OverlayStateProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
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
  };
  bowling: {
    runs: number;
    balls: number;
    wickets: number;
    maidenOvers: number;
  };
  matchesPlayed: number;
};

// ** Schema relations types

type TeamWithPlayers = Team & { players: Player[] };

type MatchExtended = Match & {
  teams: (TeamWithPlayers & { teamPlayers: TeamPlayer[] })[];
  ballEvents: BallEvent[];
};

export type {
  EventType,
  OverlayStateProps,
  PlayerPerformance,
  PlayerStats,
  TeamWithPlayers,
  MatchExtended,
};
