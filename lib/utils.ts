import { BallEvent, Player, PrismaClient } from "@prisma/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { EventType, PlayerPerformance } from "@/types";
import { invalidBalls } from "./constants";
import { toast } from "sonner";
import getCachedSession from "./auth/session";
import { redirect } from "next/navigation";

interface BatsmanStats {
  batsmanId: string;
  events: EventType[];
  outBy?: string;
}

// ** Front-end

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Filtered out wicket(-1), do not filter run out
// If event is no ball(-3), add run along with no ball and 1 run for no ball, split the last char to calculate runs along with run out
// Else return an event and ensure to convert wide(-2) to 1 run
// Sum all the runs
const calcRuns = (
  ballEvents: EventType[] | string[],
  forPlayerRuns?: boolean,
) =>
  ballEvents
    ?.filter((ball) => !(ball.includes("-1") && !ball.split("_")[3]))
    ?.map((event) =>
      event.includes("-3")
        ? (Number(event.slice(2)) + Number(!forPlayerRuns)).toString()
        : event.includes("-5")
          ? (Number(!forPlayerRuns) * Number(event.slice(2))).toString()
          : event.includes("-2")
            ? (
                Number(!forPlayerRuns) +
                Number(!forPlayerRuns) * Number(event.slice(2))
              ).toString()
            : event.replace("-4", "0").slice(-1),
    )
    .reduce((acc, cur) => acc + Number(cur), 0);

const calcWickets = (ballEvents: EventType[] | string[]) =>
  ballEvents?.filter((ball) => ball.includes("-1")).length;

const getIsInvalidBall = (ball: EventType | string) =>
  !invalidBalls.includes(ball) && !ball.includes("-3") && !ball.includes("-2");

function getScore(balls: (EventType | string)[], forPlayerRuns?: boolean) {
  const runs = calcRuns(balls, forPlayerRuns);
  const totalBalls = balls?.filter(
    (ball) => ball !== "-4" && getIsInvalidBall(ball),
  ).length;
  const wickets = calcWickets(balls);
  const runRate = Number(totalBalls ? ((runs / totalBalls) * 6).toFixed(2) : 0);

  const extras = balls
    .filter(
      (ball) =>
        ball.includes("-2") || ball.includes("-3") || ball.includes("-5"),
    )
    .map((event) =>
      event.includes("-5")
        ? Number(event.slice(2)).toString()
        : event.includes("-2")
          ? (Number(event.slice(2)) + Number(!forPlayerRuns)).toString()
          : event.includes("-3")
            ? "1"
            : "1",
    )
    .reduce((acc, cur) => acc + Number(cur), 0);
  return { runs, totalBalls, wickets, runRate, extras };
}

function generateOverSummary(ballEvents: EventType[]) {
  let ballLimitInOver = 6;
  const overSummaries: EventType[][] = [];
  let validBallCount = 0;
  let currentOver: EventType[] = [];
  for (const ballEvent of ballEvents) {
    const isInvalidBall = getIsInvalidBall(ballEvent);
    currentOver.push(ballEvent);
    if (isInvalidBall) {
      validBallCount++;
      if (validBallCount === 6) {
        overSummaries.push(currentOver);
        currentOver = [];
        validBallCount = 0;
        ballLimitInOver = 6;
      }
    } else if (ballLimitInOver !== undefined) ballLimitInOver++;
  }

  if (validBallCount >= 0 && currentOver.length > 0) {
    overSummaries.push(currentOver);
  }

  return { overSummaries, ballLimitInOver };
}

function getBatsmanStats(events: BallEvent[]): BatsmanStats[] {
  const batsmanStats: { [batsmanId: string]: BatsmanStats } = {};

  events.forEach((event) => {
    const { batsmanId, type, bowlerId } = event;

    if (!batsmanStats[batsmanId]) {
      batsmanStats[batsmanId] = {
        batsmanId: batsmanId,
        events: [],
      };
    }

    batsmanStats[batsmanId].events.push(type as EventType);

    if (type.includes("-1")) {
      batsmanStats[batsmanId].outBy = bowlerId;
    }
  });

  return Object.values(batsmanStats);
}

function getBattingStats(events: BallEvent[]) {
  const score = events.reduce(
    (acc: { fours: number; sixes: number }, ballEvent: BallEvent) => {
      if (ballEvent.type === "4") acc.fours++;
      else if (ballEvent.type === "6") acc.sixes++;

      return acc;
    },
    { fours: 0, sixes: 0 },
  );

  return { fours: score.fours, sixes: score.sixes };
}

function calculateMaidenOvers(ballsThrown: EventType[]) {
  let maidenOvers = 0;
  let ballsInCurrentOver = 0;

  let didRunCome = false;

  for (let i = 0; i < ballsThrown.length; i++) {
    const ball = ballsThrown[i];
    ballsInCurrentOver++;

    if (!(ball === "0" || ball.includes("-1") || ball.split("_")[3] === "0"))
      didRunCome = true;

    if (ballsInCurrentOver === 6) {
      if (!didRunCome) maidenOvers++;

      ballsInCurrentOver = 0;
      didRunCome = false;
    }
  }

  return maidenOvers;
}

function getOverStr(numBalls: number) {
  return `${Math.floor(numBalls / 6)}${numBalls % 6 ? `.${numBalls % 6}` : ""}`;
}

const truncStr = (str: string, n: number) => {
  return str.length > n ? str.substring(0, n - 1) + "..." : str;
};

function abbreviateName(fullName: string) {
  fullName = fullName.trim();
  const parts = fullName.split(" ");
  if (parts.length === 1) return fullName;

  const firstNameInitial = parts[0][0] + ".";
  const abbreviatedName = firstNameInitial + " " + parts[parts.length - 1];
  return abbreviatedName;
}

function processTeamName(input: string) {
  const words = input.trim().split(/\s+/);

  if (words.length === 1) return input.substring(0, 3);
  else {
    let initials = "";
    words.forEach((word) => (initials += word[0]));
    return initials;
  }
}

function calculateFallOfWickets(ballsThrown: BallEvent[], players: Player[]) {
  const fallOfWickets = [];

  for (let i = 0; i < ballsThrown.length; i++) {
    const ball = ballsThrown[i];
    if (ball.type.includes("-1")) {
      const scoreAtWicket = calcRuns(
        ballsThrown.map(({ type }) => type).slice(0, i + 1),
      );
      const outBatsman = players.find(
        (player) => player.id === ball.batsmanId,
      )?.name;
      fallOfWickets.push({
        score: scoreAtWicket,
        ball: i + 1,
        batsman: outBatsman,
      });
    }
  }
  return fallOfWickets;
}

function calculatePlayerOfTheMatch({
  playersPerformance,
}: {
  playersPerformance: PlayerPerformance[];
}) {
  let bestPerformance = -1;
  let playerOfTheMatch: PlayerPerformance = {
    playerId: "",
    runsScored: 0,
    ballsFaced: 0,
    wicketsTaken: 0,
    runConceded: 0,
    ballsBowled: 0,
    team: "",
    isWinner: false,
  };

  const WICKET_POINT = 20;
  const STRIKE_RATE_POINT = 1;
  const WINNER_POINT = 1.25;

  playersPerformance.forEach((player) => {
    const strikeRate = (player.runsScored / player.ballsFaced) * 100;

    const performanceScore =
      player.runsScored + player.wicketsTaken * WICKET_POINT;

    const adjustedPerformanceScore =
      performanceScore *
      (((strikeRate || 100) / 100) * STRIKE_RATE_POINT) *
      (player.isWinner ? WINNER_POINT : 1);

    if (adjustedPerformanceScore > bestPerformance) {
      bestPerformance = adjustedPerformanceScore;
      playerOfTheMatch = player;
    }
  });

  return playerOfTheMatch;
}

function calculateWinner({
  allowSinglePlayer,
  matchBalls,
  runs1,
  runs2,
  totalBalls,
  totalWickets,
  wickets2,
  teams,
}: {
  runs1: number;
  runs2: number;
  totalWickets: number;
  wickets2: number;
  matchBalls: number;
  totalBalls: number;
  allowSinglePlayer: boolean;
  teams: string[];
}) {
  let winInfo = "";
  let winner;

  if (runs1 > runs2) {
    winInfo = `${processTeamName(teams[0])} won by ${runs1 - runs2} runs`;
    winner = 0;
  } else if (runs2 > runs1) {
    const wicketMargin = totalWickets - wickets2 - Number(!allowSinglePlayer);
    winInfo = `${processTeamName(teams[1])} won by ${wicketMargin} wicket${wicketMargin > 1 ? "s" : ""} (${matchBalls - totalBalls} balls left)`;
    winner = 1;
  } else {
    winInfo =
      "Match Tied (Sorry for the inconvenience but we don't have super over feature yet)";
    winner = -1;
  }

  return { winInfo, winner };
}

function toastError(err: unknown) {
  if (err instanceof Error) toast.error(err.message);
  else toast.error("Something went wrong!");
}

function round(num: number, places = 2) {
  return Math.round(num * Math.pow(10, places)) / Math.pow(10, places);
}

// ** Backend

async function getValidatedUser() {
  const session = await getCachedSession();
  if (!session?.user?.id) throw new Error("User not authenticated");

  return session.user.id;
}

async function createOrUpdateWithUniqueName(
  name: string,
  schema: PrismaClient["player"] | PrismaClient["team"] | PrismaClient["match"],
  entityId?: string,
) {
  const userId = await getValidatedUser();

  if (!userId) throw new Error("User not authenticated");

  let newName = name;
  let counter = 0;
  let entityExists = true;

  if (entityId) {
    const existingEntity = await (schema as PrismaClient["player"]).findFirst({
      where: {
        AND: [{ id: { not: entityId } }, { userId: userId }, { name: newName }],
      },
    });

    if (existingEntity) {
      counter++;
      newName = `${name} (${counter})`;
    } else {
      entityExists = false;
    }
  } else {
    while (entityExists) {
      const existingEntity = await (schema as PrismaClient["player"]).findFirst(
        {
          where: {
            userId: userId,
            name: newName,
          },
        },
      );

      if (existingEntity) {
        counter++;
        newName = `${name} (${counter})`;
      } else {
        entityExists = false;
      }
    }
  }

  return newName;
}

function calcMilestones(groupedMatches: { [matchId: string]: BallEvent[] }) {
  let fifties = 0;
  let centuries = 0;
  let highestScore = 0;
  for (const matchId in groupedMatches) {
    const matchEvents = groupedMatches[matchId];

    const { runs } = getScore(
      matchEvents.map((event) => event.type),
      true,
    );

    if (runs >= 50 && runs < 100) fifties++;
    if (runs >= 100) centuries++;
    if (runs > highestScore) highestScore = runs;
  }

  return { fifties, centuries, highestScore };
}

function handleError(err: unknown) {
  if (err instanceof Error) throw new Error(err.message);
  else throw new Error("Something went wrong!");
}

async function checkSession() {
  const session = await getCachedSession();
  if (!session) redirect("/");
}

export {
  cn,
  getScore,
  generateOverSummary,
  getBatsmanStats,
  truncStr,
  calcRuns,
  calcWickets,
  getIsInvalidBall,
  getOverStr,
  getBattingStats,
  calculateMaidenOvers,
  processTeamName,
  abbreviateName,
  calculateFallOfWickets,
  calculatePlayerOfTheMatch,
  calculateWinner,
  toastError,
  round,
  // Backend
  getValidatedUser,
  createOrUpdateWithUniqueName,
  calcMilestones,
  handleError,
  checkSession,
};
