import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { EventType } from "@/types";
import { invalidBalls } from "./constants";
import { BallEvent } from "@prisma/client";

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

const truncStr = (str: string, n: number) => {
  return str.length > n ? str.substring(0, n - 1) + "..." : str;
};

export {
  cn,
  getScore,
  generateOverSummary,
  getBatsmanStats,
  truncStr,
  calcRuns,
  calcWickets,
  getIsInvalidBall,
};
