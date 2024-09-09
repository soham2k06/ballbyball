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

// type BattingRecordsType = {
//   player: Player;
//   runs: number;
//   innings: number;
//   matches: number;
//   average: number;
//   strikeRate: number;
//   milestones: {
//     fifties: number;
//     centuries: number;
//     highestScore: number;
//     isNotout: boolean;
//   };
//   fours: number;
//   sixes: number;
// };

// type BowlingRecordsType = {
//   player: Player;
//   wickets: number;
//   totalBalls: number;
//   matches: number;
//   economy: number;
//   strikeRate: number;
//   bestSpell: {
//     wickets: number;
//     runs: number;
//     balls: number;
//   };
//   maidens: number;
//   runsConceded: number;
//   dots: number;
// };

// ** Schema relations types

type TeamWithPlayers = Team & { players: Player[] };

type PlayerSimplified = Pick<Player, "id" | "name">;

type MatchExtended = Match & {
  teams: (TeamWithPlayers & { batFirst?: boolean; playerIds: string[] })[];
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
  PlayerSimplified,
  TopPerformant,
};
