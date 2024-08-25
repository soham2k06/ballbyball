import prisma from "@/lib/db/prisma";
import { calcMilestones, calculateMaidenOvers, getScore } from "@/lib/utils";
import { EventType } from "@/types";
import { BallEvent } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(
  _: unknown,
  { params: { id } }: { params: { id: string } },
) {
  try {
    const playerBallEvents = await prisma.ballEvent.findMany({
      where: { OR: [{ batsmanId: id }, { bowlerId: id }] },
    });

    const groupedMatches: { [matchId: string]: BallEvent[] } = {};

    const battingEventsExtended = playerBallEvents.filter(
      (event) => event.batsmanId === id,
    );

    for (const event of battingEventsExtended) {
      const matchId = event.matchId ?? "no-data";
      if (!groupedMatches[matchId]) {
        groupedMatches[matchId] = [];
      }
      groupedMatches[matchId].push(event);
    }

    const { fifties, centuries, highestScore, isNotout } =
      calcMilestones(groupedMatches);

    const battingEvents = battingEventsExtended.map((event) => event.type);

    const bowlingEvents = playerBallEvents
      .filter((event) => event.bowlerId === id)
      .map((event) => event.type);

    const {
      runs: runsScored,
      totalBalls: ballsFaced,
      wickets: outs,
    } = getScore(battingEvents, true);

    const battingStats = {
      runs: runsScored,
      balls: ballsFaced,
      wickets: outs,
    };

    const {
      runs: runsConceded,
      totalBalls: ballsBowled,
      wickets: wicketsTaken,
    } = getScore(bowlingEvents);

    const maidenOverCount = calculateMaidenOvers(bowlingEvents as EventType[]);

    const bowlingStats = {
      runs: runsConceded,
      balls: ballsBowled,
      wickets: wicketsTaken,
      maidenOvers: maidenOverCount,
    };

    const matchesPlayed = await prisma.match.count({
      where: {
        matchTeams: {
          some: { team: { teamPlayers: { some: { playerId: id } } } },
        },
      },
    });

    const playerStats = {
      matchesPlayed,
      batting: {
        ...battingStats,
        fifties,
        centuries,
        highestScore,
        isNotoutOnHighestScore: isNotout,
      },
      bowling: bowlingStats,
    };

    if (!playerStats)
      return NextResponse.json({ error: "No data found" }, { status: 404 });

    return NextResponse.json(playerStats, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
