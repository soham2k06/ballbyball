import { redirect } from "next/navigation";

import { BallEvent, Player, PrismaClient } from "@prisma/client";
import { type ClassValue, clsx } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

import { CommentKey, EventType, PlayerPerformance } from "@/types";

import getCachedSession from "./auth/session";
import { commentsCollection, invalidBalls, wicketTypes } from "./constants";

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
            ? (Number(event.slice(2)) + Number(!forPlayerRuns)).toString()
            : event.slice(-1),
    )
    .reduce((acc, cur) => acc + Number(cur), 0);

const calcWickets = (ballEvents: EventType[] | string[], forPlayer?: boolean) =>
  ballEvents?.filter((ball) => {
    if (ball.includes("-1")) {
      if (!forPlayer) return true;
      const typeId = Number(ball.split("_")[1]);
      const wicketType = wicketTypes.find((item) => item.id === typeId);
      if (wicketType?.isNotBowlersWicket) return false;
      return ball.includes("-1");
    }
  }).length;

const getIsvalidBall = (ball: EventType | string, countNB?: boolean) =>
  !invalidBalls.includes(ball) &&
  !ball.includes("-2") &&
  !(!countNB && ball.includes("-3"));

function getScore({
  balls,
  forBatsman,
  forBowler,
}: {
  balls: (EventType | string)[];
  forBatsman?: boolean;
  forBowler?: boolean;
}) {
  const runs = calcRuns(balls, forBatsman);

  const totalBalls = balls?.filter((ball) =>
    getIsvalidBall(ball, forBatsman),
  ).length;

  const wickets = calcWickets(balls, forBowler);
  const runRate = totalBalls ? round((runs / totalBalls) * 6) : 0;

  const extras = balls
    .filter(
      (ball) =>
        ball.includes("-2") || ball.includes("-3") || ball.includes("-5"),
    )
    .map((event) =>
      event.includes("-5")
        ? Number(event.slice(2)).toString()
        : event.includes("-3")
          ? "1"
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
    const isInvalidBall = getIsvalidBall(ballEvent);
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

function getCommentByEvent({
  batsman,
  bowler,
  event,
  fielder,
  randomIndex,
}: {
  batsman: string;
  bowler: string;
  event: CommentKey;
  fielder?: string;
  randomIndex: number;
}) {
  function replacePlaceHolder(str: string) {
    return str
      .replace(/{batsman}/g, batsman)
      .replace(/{bowler}/g, bowler)
      .replace(/{fielder}/g, fielder ?? "fielder");
  }

  const getRandomComment = (comments: string[]) => comments[randomIndex];

  // Handle wicket events
  if (event.startsWith("-1_")) {
    const comments = commentsCollection[event.substring(0, 4) as CommentKey];
    if (comments)
      return replacePlaceHolder(getRandomComment(comments) ?? comments[0]);
  } else if (
    event.startsWith("-3") ||
    event.startsWith("-2") ||
    event.startsWith("-5")
  ) {
    // No ball, Wide, Byes with runs
    const baseEvent = event.substring(0, 2) as CommentKey;
    const runEvent = event.substring(2) as CommentKey;

    const baseComments = commentsCollection[baseEvent];
    const runComments = runEvent !== "0" ? commentsCollection[runEvent] : [];

    if (baseComments && runComments) {
      const baseComment = replacePlaceHolder(
        getRandomComment(baseComments) ?? baseComments[0],
      );
      const runComment =
        runEvent !== "0"
          ? replacePlaceHolder(getRandomComment(runComments) ?? runComments[0])
          : "";
      return `${baseComment}${runComment ? ` and ${runComment}` : ""}`;
    } else if (baseComments)
      return replacePlaceHolder(
        getRandomComment(baseComments) ?? baseComments[0],
      );
    else if (runComments)
      return replacePlaceHolder(
        getRandomComment(runComments) ?? runComments[0],
      );
  } else {
    // Normal events
    const comments = commentsCollection[event];
    if (comments)
      return replacePlaceHolder(getRandomComment(comments) ?? comments[0]);
  }
  // Default comment
  return "An unusual event occurred!";
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
      let ballType = ballEvent.type;
      // Handling runs with no ball
      if (ballType.includes("-3")) ballType = ballType.slice(2);

      if (ballType === "4") acc.fours++;
      else if (ballType === "6") acc.sixes++;

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

    const isDot = ball === "0";
    const isWicket = ball.includes("-1");
    const isRunWithRunoutZero = ball.split("_")[3] === "0";
    const isExtra = ball.includes("-2") || ball.includes("-3");

    if (!isExtra) ballsInCurrentOver++;

    if (!(isDot || isWicket || isRunWithRunoutZero) || isExtra)
      didRunCome = true;

    if (ballsInCurrentOver === 6) {
      if (!didRunCome) maidenOvers++;

      ballsInCurrentOver = 0;
      didRunCome = false;
    }
  }

  return maidenOvers;
}

function mapGroupedMatches(events: BallEvent[]) {
  const groupedMatches: { [matchId: string]: BallEvent[] } = {};
  for (const event of events) {
    const matchId = event.matchId ?? "no-data";
    if (!groupedMatches[matchId]) {
      groupedMatches[matchId] = [];
    }
    groupedMatches[matchId].push(event);
  }

  return groupedMatches;
}

function getOverStr(numBalls: number, show6?: boolean) {
  if (show6) {
    const isLastBall = numBalls % 6 === 0;
    return `${Math.floor(numBalls / 6) - (isLastBall ? 1 : 0)}.${isLastBall ? 6 : numBalls % 6}`;
  }
  return `${Math.floor(numBalls / 6)}${numBalls % 6 ? `.${numBalls % 6}` : ""}`;
}

function abbreviateName(fullName: string) {
  fullName = fullName.trim();
  const parts = fullName.split(" ");
  if (parts.length === 1) return fullName;

  const firstNameInitial = parts[0][0] + ".";
  const abbreviatedName = firstNameInitial + " " + parts[parts.length - 1];
  return abbreviatedName;
}

function abbreviateEntity(input: string) {
  const words = input
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(/\s+/);

  if (words.length === 1) return input.substring(0, 3);
  else {
    let initials = "";
    words.forEach((word) => (initials += word[0]));
    return initials;
  }
}

function calculateFallOfWickets(ballsThrown: BallEvent[], players: Player[]) {
  const fallOfWickets = [];

  let totalBalls = 0;

  for (let i = 0; i < ballsThrown.length; i++) {
    if (getIsvalidBall(ballsThrown[i].type)) totalBalls++;
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
        ball: totalBalls,
        batsman: outBatsman,
      });
    }
  }
  return fallOfWickets;
}

function calcBestPerformance({
  playersPerformance,
}: {
  playersPerformance: Omit<PlayerPerformance, 'team'>[];
}) {
  playersPerformance.forEach((player) => {
    let curPlayerPoints = 0;

    // Batting points
    curPlayerPoints += player.runsScored * 1;
    curPlayerPoints += player.fours * 1;
    curPlayerPoints += player.sixes * 2;
    curPlayerPoints += player.thirties * 4;
    curPlayerPoints += player.fifties * 8;
    curPlayerPoints += player.centuries * 16;
    curPlayerPoints += player.isDuck ? -2 : 0;

    // Bowling Points
    curPlayerPoints += player.wicketsTaken * 20;
    if (player.is2) curPlayerPoints += 4;
    if (player.is3) curPlayerPoints += 8;
    curPlayerPoints += player.maidens * 12;

    // Fielding Points
    curPlayerPoints += player.catches * 8;
    curPlayerPoints += player.stumpings * 12;
    curPlayerPoints += player.runOuts * 6;

    // Economy Points, if min 6 balls bowled
    if (player.ballsBowled > 6) {
      if (player.economy < 5) curPlayerPoints += 6;
      else if (player.economy >= 5 && player.economy < 6) curPlayerPoints += 4;
      else if (player.economy >= 6 && player.economy < 7) curPlayerPoints += 2;
      else if (player.economy >= 10 && player.economy < 11)
        curPlayerPoints -= 2;
      else if (player.economy >= 11 && player.economy < 12)
        curPlayerPoints -= 4;
      else if (player.economy >= 12) curPlayerPoints -= 6;
    }

    // Strike rate Points, if min 6 balls faced
    if (player.ballsFaced > 6) {
      if (player.strikeRate > 170) curPlayerPoints += 6;
      else if (player.strikeRate >= 150 && player.strikeRate <= 170)
        curPlayerPoints += 4;
      else if (player.strikeRate >= 130 && player.strikeRate <= 150)
        curPlayerPoints += 2;
      else if (player.strikeRate >= 60 && player.strikeRate <= 70)
        curPlayerPoints -= 2;
      else if (player.strikeRate >= 50 && player.strikeRate <= 60)
        curPlayerPoints -= 4;
      else if (player.strikeRate < 50) curPlayerPoints -= 6;
    }

    // Winner points
    if (player.isWinner) curPlayerPoints += 25;

    player.points = curPlayerPoints;
  });

  return playersPerformance.sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
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
    winInfo = `${abbreviateEntity(teams[0])} won by ${runs1 - runs2} runs`;
    winner = 0;
  } else if (runs2 > runs1) {
    const wicketMargin = totalWickets - wickets2 - Number(!allowSinglePlayer);
    winInfo = `${abbreviateEntity(teams[1])} won by ${wicketMargin} wicket${wicketMargin > 1 ? "s" : ""} (${matchBalls - totalBalls} balls left)`;
    winner = 1;
  } else {
    winInfo =
      "Match Tied (Sorry for the inconvenience but we don't have super over feature yet)";
    winner = -1;
  }

  return { winInfo, winner };
}

function getIsNotOut({
  playerId,
  ballEvents,
  events,
}: {
  playerId?: string;
  ballEvents?: BallEvent[];
  events?: EventType[];
}) {
  if (events) return events.every((evt) => !evt.includes("-1"));

  if (ballEvents && playerId)
    return ballEvents
      .filter((event) => event.batsmanId === playerId)
      .map((event) => event.type)
      .every((evt) => !evt.includes("-1"));
}

function toastError(err: unknown) {
  if (err instanceof Error) toast.error(err.message);
  else toast.error("Something went wrong!");
}

function round(num: number, places = 2) {
  return Math.round(num * Math.pow(10, places)) / Math.pow(10, places);
}

function toPercentage(value1: number, value2: number): [number, number] {
  const total = value1 + value2;
  const percentage1 = Math.round((value1 / total) * 100);
  const percentage2 = 100 - percentage1;
  return [percentage1, percentage2];
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
    while (entityExists) {
      const existingEntity = await (schema as PrismaClient["player"]).findFirst(
        {
          where: {
            AND: [{ id: { not: entityId } }, { userId }, { name: newName }],
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
  } else {
    while (entityExists) {
      const existingEntity = await (schema as PrismaClient["player"]).findFirst(
        {
          where: {
            userId,
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
  let thirties = 0;
  let fifties = 0;
  let centuries = 0;
  let highestScore = 0;
  let isNotout = false;
  for (const matchId in groupedMatches) {
    const matchEvents = groupedMatches[matchId];

    const { runs, wickets } = getScore({
      balls: matchEvents.map((event) => event.type),
      forBatsman: true,
    });

    if (runs >= 30 && runs < 50) thirties++;
    if (runs >= 50 && runs < 100) fifties++;
    if (runs >= 100) centuries++;
    if (runs > highestScore) {
      highestScore = runs;
      isNotout = wickets === 0;
    }
  }

  return { thirties, fifties, centuries, highestScore, isNotout };
}

function calcWicketHauls(groupedMatches: { [matchId: string]: BallEvent[] }) {
  let threes = 0;
  let fives = 0;
  for (const matchId in groupedMatches) {
    const matchEvents = groupedMatches[matchId];

    const { wickets } = getScore({
      balls: matchEvents.map((event) => event.type),
      forBowler: true,
    });

    if (wickets === 3 || wickets === 4) threes++;
    if (wickets >= 5) fives++;
  }

  return { threes, fives };
}

function calcBestSpells(data: EventType[][], topN: number = 1) {
  const playerStats = data.map((balls) => getScore({ balls, forBowler: true }));

  playerStats.sort((a, b) => {
    if (b.wickets === a.wickets) return a.runRate - b.runRate;
    return b.wickets - a.wickets;
  });

  return playerStats
    .map((spell) => ({
      runs: spell.runs,
      balls: spell.totalBalls,
      wickets: spell.wickets,
    }))
    .slice(0, topN);
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
  calcRuns,
  calcWickets,
  getIsvalidBall,
  getOverStr,
  getBattingStats,
  calculateMaidenOvers,
  abbreviateEntity,
  abbreviateName,
  calculateFallOfWickets,
  calcBestPerformance,
  calculateWinner,
  getIsNotOut,
  toastError,
  round,
  getCommentByEvent,
  mapGroupedMatches,
  calcBestSpells,
  toPercentage,
  // Backend
  getValidatedUser,
  createOrUpdateWithUniqueName,
  calcMilestones,
  calcWicketHauls,
  handleError,
  checkSession,
};
