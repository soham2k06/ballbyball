import { Dispatch, SetStateAction } from "react";

import { BallEvent, Match, Player, Team } from "@prisma/client";

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
  name: string;
  matchesPlayed: number;
  inningsPlayed: number;
  matchesWon: number;
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
  points: number;
};

type PlayerStats = {
  batting: {
    runs: number;
    balls: number;
    wickets: number;

    ducks: number;
    twenties: number;
    thirties: number;
    fifties: number;
    centuries: number;
    highestScore: {
      runs: number;
      balls: number;
      isNotout: boolean;
    };

    boundaryRate: number;
    dotsPlayed: number;
    singles: number;
    fours: number;
    sixes: number;
  };
  bowling: {
    runs: number;
    balls: number;
    wickets: number;
    maidens: number;
    dotBalls: number;
    // dotBallsRate: number;
    bestSpell: {
      wickets: number;
      runs: number;
      balls: number;
    };
    extras: number;
    economy: number;
    fiveHauls: number;
    threeHauls: number;
    hattricks: number;
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
  recentBalls: string[];
}

type BattingRecordsType = {
  player: {
    id: string;
    name: string;
  };
  runs: number;
  ballsFaced: number;
  matchesPlayed: number;
  innings: number;
  milestones: {
    highestScore: {
      runs: number;
      balls: number;
      isNotout: boolean;
    };
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
  matchesPlayed: number;
  economy: number;
  strikeRate: number;
  maidens: number;
  threeHauls: number;
  fiveHauls: number;
  bestSpell: { wickets: number; runs: number; balls: number };
  runsConceded: number;
  dots: number;
  hattricks: number;
};

type RecordBallEvent = {
  // batsmanId: string;
  // bowlerId: string;
  Match: { createdAt: Date };
  type: string;
  matchId: string;
};

type RecordType = {
  id: string;
  name: string;
  matchesPlayed: number;
  inningsPlayed: number;
  matchesWon: number;
  playerBatEvents: RecordBallEvent[];
  playerBallEvents: RecordBallEvent[];
  playerFieldEvents: RecordBallEvent[];
};

type RecordsProps = {
  date: string | null;
  matches: string | null;
};

// ** Schema relations types

type TeamWithPlayers = Team & { players: Player[] };

type PlayerSimplified = Pick<Player, "id" | "name">;

type MatchExtended = Match & {
  teams: (TeamWithPlayers & { batFirst?: boolean; playerIds: string[] })[];
  ballEvents: BallEvent[];
};

type BallEventSemi = Pick<
  BallEvent,
  "batsmanId" | "bowlerId" | "type" | "matchId"
>;

export type {
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
  BallEventSemi,
  RecordType,
  RecordBallEvent,
  RecordsProps,
};
