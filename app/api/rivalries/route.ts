import prisma from "@/lib/db/prisma";
import { getScore, getValidatedUser } from "@/lib/utils";
import { RivalriesResult } from "@/types";
import { BallEvent, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

function getAllRivalries(
  events: (Omit<BallEvent, "userId" | "id" | "matchId"> & {
    batsman: { name: string };
    bowler: { name: string };
  })[],
): RivalriesResult[] {
  const rivalries: Record<string, RivalriesResult> = {};

  events.forEach((event) => {
    const { batsmanId, bowlerId, type } = event;
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
    }

    const rivalry = rivalries[key];

    const { runs, totalBalls, wickets } = getScore({
      balls: [type],
      forBatsman: true,
    });

    rivalry.balls += totalBalls;
    rivalry.wickets += wickets;
    rivalry.runs += runs;
    rivalry.strikeRate = (rivalry.runs / rivalry.balls) * 100;
    if (event.type === "0") rivalry.dots++;
    if (
      !event.type.includes("-1") &&
      (event.type.includes("4") || event.type.includes("6"))
    )
      rivalry.boundaries++;

    rivalry.weight =
      rivalry.wickets * 25 +
      rivalry.runs +
      rivalry.boundaries * 2 +
      rivalry.dots / 2;
  });

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
          const ballEvents = await prisma.ballEvent.findMany({
            where: {
              userId,
              OR: [
                { batsmanId: rivalry.batsmanId, bowlerId: rivalry.bowlerId },
                { batsmanId: rivalry.bowlerId, bowlerId: rivalry.batsmanId },
              ],
            },
            select: { matchId: true },
          });

          const matches = new Set(ballEvents.map((event) => event.matchId))
            .size;

          let batsmanPoints = 0;
          let bowlerPoints = 0;

          batsmanPoints += rivalry.runs;
          batsmanPoints += rivalry.boundaries * 2;
          if (rivalry.balls > 12) {
            if (rivalry.strikeRate > 170) batsmanPoints += 6;
            else if (rivalry.strikeRate >= 150 && rivalry.strikeRate <= 170)
              batsmanPoints += 4;
            else if (rivalry.strikeRate >= 130 && rivalry.strikeRate <= 150)
              batsmanPoints += 2;
            else if (rivalry.strikeRate >= 60 && rivalry.strikeRate <= 70)
              batsmanPoints -= 2;
            else if (rivalry.strikeRate >= 50 && rivalry.strikeRate <= 60)
              batsmanPoints -= 4;
            else if (rivalry.strikeRate < 50) batsmanPoints -= 6;
          }

          bowlerPoints += rivalry.wickets * 25;
          bowlerPoints += rivalry.dots / 2;

          const batsmanDominance =
            (batsmanPoints / (batsmanPoints + bowlerPoints)) * 100;
          const bowlerDominance =
            (bowlerPoints / (batsmanPoints + bowlerPoints)) * 100;

          rivalry.dominance = [
            Math.round(batsmanDominance),
            Math.round(bowlerDominance),
          ];

          rivalry.matches = matches;

          return rivalry;
        }),
    );

    return NextResponse.json(rivalries.sort((a, b) => b.weight - a.weight));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
