import { NextRequest, NextResponse } from "next/server";

import { BallEvent, Prisma } from "@prisma/client";

import prisma from "@/lib/db/prisma";
import { getIsvalidBall, getScore, getValidatedUser } from "@/lib/utils";
import { RivalriesResult } from "@/types";

function getAllRivalries(
  events: (Omit<BallEvent, "userId" | "id"> & {
    batsman: { name: string };
    bowler: { name: string };
  })[],
): RivalriesResult[] {
  const rivalries: Record<string, RivalriesResult> = {};

  const rivalryMatches: Record<string, Set<string>> = {};

  events.forEach((event) => {
    const { batsmanId, bowlerId, type, matchId } = event;
    const key = `${batsmanId}-${bowlerId}`;

    if (!rivalries[key]) {
      rivalries[key] = {
        batsmanId,
        bowlerId,
        batsman: event.batsman.name,
        bowler: event.bowler.name,
        wickets: 0,
        strikeRate: 0,
        runs: 0,
        balls: 0,
        dots: 0,
        boundaries: 0,
        weight: 0,
        matches: 0,
        dominance: [0, 0],
      };

      rivalryMatches[key] = new Set();
    }

    const rivalry = rivalries[key];

    if (matchId) rivalryMatches[key].add(matchId);

    const { runs, totalBalls, wickets } = getScore({
      balls: [type],
      forBatsman: true,
    });

    const isValidBall = getIsvalidBall(type);

    if (isValidBall) rivalry.balls += totalBalls;
    rivalry.wickets += wickets;
    rivalry.runs += runs;
    rivalry.strikeRate = (rivalry.runs / rivalry.balls) * 100;
    if (type === "0") rivalry.dots++;
    if (!type.includes("-1") && (type.includes("4") || type.includes("6")))
      rivalry.boundaries++;

    rivalry.weight =
      rivalry.wickets * 15 +
      rivalry.runs +
      rivalry.boundaries * 2 +
      rivalry.dots / 2;
  });

  Object.keys(rivalries).forEach((key) => {
    rivalries[key].matches = rivalryMatches[key].size;
  });

  console.log(Object.values(rivalries));
  return Object.values(rivalries);
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const user = sp.get("user");
  const player = sp.get("player");
  const batsman = sp.get("batsman");
  const bowler = sp.get("bowler");
  const all = sp.get("all") === "true";

  const userId = user ?? (await getValidatedUser());

  const whereQuery: Prisma.BallEventWhereInput = {
    userId,
    ...(!all
      ? {
          ...(player
            ? { OR: [{ batsmanId: player }, { bowlerId: player }] }
            : {}),
          ...(batsman ? { batsmanId: batsman } : {}),
          ...(bowler ? { bowlerId: bowler } : {}),
        }
      : {}),
  };

  try {
    const ballEvents = await prisma.ballEvent.findMany({
      where: {
        userId,
        ...whereQuery,
      },
      select: {
        batsman: { select: { name: true } },
        bowler: { select: { name: true } },
        batsmanId: true,
        bowlerId: true,
        type: true,
        matchId: true,
      },
    });

    const allRivalries = getAllRivalries(ballEvents);

    const rivalries = await Promise.all(
      allRivalries
        .filter(
          (rivalry) =>
            rivalry.balls > 0 || rivalry.runs > 0 || rivalry.wickets > 0,
        )
        .map(async (rivalry) => {
          let batsmanPoints = 0;
          let bowlerPoints = 0;

          batsmanPoints += rivalry.runs;
          batsmanPoints += rivalry.boundaries * 2;
          if (rivalry.balls > 12) {
            const sr = rivalry.strikeRate;
            const srPoints = (sr - 100) / 2;
            batsmanPoints += srPoints;
          }

          bowlerPoints += rivalry.wickets * 30;
          bowlerPoints += rivalry.dots;

          const batsmanDominance =
            (batsmanPoints / (batsmanPoints + bowlerPoints)) * 100;
          const bowlerDominance =
            (bowlerPoints / (batsmanPoints + bowlerPoints)) * 100;

          rivalry.dominance = [
            Math.round(Math.min(100, Math.max(0, batsmanDominance))),
            Math.round(Math.min(100, Math.max(0, bowlerDominance))),
          ];

          return rivalry;
        }),
    );

    return NextResponse.json(rivalries.sort((a, b) => b.weight - a.weight));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
