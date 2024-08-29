import prisma from "@/lib/db/prisma";
import { getScore, getValidatedUser } from "@/lib/utils";
import { BallEvent } from "@prisma/client";
import { NextResponse } from "next/server";

interface ComparisonResult {
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
}

function getAllComparisons(
  events: (Omit<BallEvent, 'userId' | 'id' | "matchId"> & {
    batsman: { name: string };
    bowler: { name: string };
  })[],
): ComparisonResult[] {
  const comparisons: Record<string, ComparisonResult> = {};

  events.forEach((event) => {
    const { batsmanId, bowlerId, type } = event;
    const key = `${batsmanId}-${bowlerId}`;

    if (!comparisons[key]) {
      comparisons[key] = {
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
      };
    }

    const comparison = comparisons[key];

    const { runs, totalBalls, wickets } = getScore([type], true);

    comparison.balls += totalBalls;
    comparison.wickets += wickets;
    comparison.runs += runs;
    comparison.strikeRate = (comparison.runs / comparison.balls) * 100;
    if (event.type === "0") comparison.dots++;
    if (
      !event.type.includes("-1") &&
      (event.type.includes("4") || event.type.includes("6"))
    )
      comparison.boundaries++;

    comparison.weight =
      comparison.wickets * 25 +
      comparison.runs +
      comparison.boundaries * 2 +
      comparison.dots;
  });

  return Object.values(comparisons);
}

export async function GET() {
  const userId = await getValidatedUser();

  try {
    const ballEvents = await prisma.ballEvent.findMany({
      where: { userId },
      select: {
        // TODO: Try to use count instead of fetching all matches
        Match: { select: { id: true, _count: true } },
        batsman: { select: { name: true } },
        bowler: { select: { name: true } },
        batsmanId: true,
        bowlerId: true,
        type: true,
      },
    });

    const matchesCount = new Set(ballEvents.map((event) => event.Match?.id));

    const allComparisons = getAllComparisons(ballEvents);

    const comparisons = await Promise.all(
      allComparisons
        .filter(
          (comparison) =>
            comparison.balls > 0 ||
            comparison.runs > 0 ||
            comparison.wickets > 0,
        )
        .map((comparison) => ({
          ...comparison,
          matches: matchesCount.size,
        }))
        .sort((a, b) => b.weight - a.weight),
    );

    return NextResponse.json(comparisons);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
