import { BallEvent, Player } from "@prisma/client";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { EventType } from "@/types";
import { invalidBalls } from "./constants";

interface BatsmanStats {
  batsmanId: string;
  events: EventType[];
  outBy?: string;
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Filtered out wicket(-1)
// If event is no ball(-3), add run along with no ball and 1 run for no ball
// Else return an event and ensure to convert wide(-2) to 1 run
// Sum all the runs
const calcRuns = (ballEvents: EventType[] | string[], forPlayer?: boolean) =>
  ballEvents
    ?.filter((ball) => ball !== "-1")
    ?.map((event) =>
      event.includes("-3")
        ? (Number(event.slice(2)) + Number(!forPlayer)).toString()
        : event.replace("-2", "1"),
    )
    .reduce((acc, cur) => acc + Number(cur), 0);

const calcWickets = (ballEvents: EventType[] | string[]) =>
  ballEvents?.filter((ball) => ball === "-1").length;

const getIsInvalidBall = (ball: EventType) =>
  !invalidBalls.includes(ball) && !ball.includes("-3");

function getScore(balls: EventType[]) {
  const runs = calcRuns(balls);
  const totalBalls = balls?.filter((ball) => getIsInvalidBall(ball)).length;
  const wickets = calcWickets(balls);
  const runRate = Number(totalBalls ? ((runs / totalBalls) * 6).toFixed(2) : 0);
  const extras = balls.filter(
    (ball) => ball === "-2" || ball.includes("-3"),
  ).length;

  return { runs, totalBalls, wickets, runRate, extras };
}

function generateOverSummary({
  ballEvents,
  ballLimitInOver,
}: {
  ballEvents: EventType[];
  ballLimitInOver: number;
}) {
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
    } else ballLimitInOver++;
  }

  if (validBallCount >= 0 && currentOver.length > 0) {
    overSummaries.push(currentOver);
  }

  return overSummaries;
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

    if (type === "-1") {
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
    if (ball.type === "-1") {
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
  processTeamName,
  abbreviateName,
  calculateFallOfWickets,
};
