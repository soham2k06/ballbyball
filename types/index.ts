import { Dispatch, SetStateAction } from "react";

import { BallEvent, Match, Player, Team } from "@prisma/client";

import { commentsCollection } from "@/lib/constants";

type EventType = "0" | "1" | "2" | "3" | "4" | "6" | "-1" | "-2" | "-3" | "-5";

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
  catches: number;
  runOuts: number;
  stumpings: number;
  fours: number;
  sixes: number;
  economy: number;
  strikeRate: number;
  thirties: number;
  fifties: number;
  centuries: number;
  is2: boolean;
  is3: boolean;
  isDuck: boolean;
  maidens: number;
  team: string;
  isWinner: boolean;
  points?: number;
};

type PlayerStats = {
  batting: {
    runs: number;
    balls: number;
    wickets: number;
    fifties: number;
    centuries: number;
    ducks: number;
    highestScore: number;
    isNotoutOnHighestScore: boolean;
    boundaryRate: number;
    dotsPlayed: number;
    singles: number;
    thirties: number;
    fours: number;
    sixes: number;
  };
  bowling: {
    runs: number;
    balls: number;
    wickets: number;
    maidens: number;
    dotBalls: number;
    dotBallsRate: number;
    bestSpell: {
      wickets: number;
      runs: number;
      balls: number;
    };
    extras: number;
    economy: number;
    fiveHauls: number;
    threeHauls: number;
  };
  fielding: { catches: number; runOuts: number; stumpings: number };
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

interface RivalriesResult {
  batsmanId: string;
  bowlerId: string;
  batsman: string;
  bowler: string;
  wickets: number;
  strikeRate: number;
  runs: number;
  balls: number;
  dots: number;
  boundaries: number;
  weight: number;
  matches: number;
  dominance: [number, number];
}

type BattingRecordsType = {
  player: {
    id: string;
    name: string;
  };
  runs: number;
  ballsFaced: number;
  matches: number;
  innings: number;
  milestones: {
    highestScore: number;
    isNotout: boolean;
    thirties: number;
    fifties: number;
    centuries: number;
  };
  average: number;
  strikeRate: number;
  notOuts: number;
  fours: number;
  sixes: number;
};

type BowlingRecordsType = {
  player: {
    id: string;
    name: string;
  };
  wickets: number;
  totalBalls: number;
  matches: number;
  economy: number;
  strikeRate: number;
  maidens: number;
  threeHauls: number;
  fiveHauls: number;
  bestSpell: { wickets: number; runs: number; balls: number };
  runsConceded: number;
  dots: number;
};
type CommentKey = keyof typeof commentsCollection;

// ** Schema relations types

type TeamWithPlayers = Team & { players: Player[] };

type PlayerSimplified = Pick<Player, "id" | "name">;

type MatchExtended = Match & {
  teams: (TeamWithPlayers & { batFirst?: boolean; playerIds: string[] })[];
  ballEvents: BallEvent[];
};

export type {
  CommentKey,
  EventType,
  OverlayStateProps,
  PlayerPerformance,
  PlayerStats,
  TeamWithPlayers,
  MatchExtended,
  PlayerMatches,
  PlayerScore,
  PlayerSimplified,
  TopPerformant,
  RivalriesResult,
  BattingRecordsType,
  BowlingRecordsType,
};
