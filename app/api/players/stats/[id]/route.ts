import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";
import {
  calcBestSpells,
  calcMilestones,
  calcRuns,
  calculateMaidenOvers,
  calcWicketHauls,
  countHatTricks,
  getScore,
  getValidatedUser,
  mapGroupedMatches,
} from "@/lib/utils";
import { EventType, PlayerStats } from "@/types";

export async function GET(
  req: NextRequest,
  { params: { id } }: { params: { id?: string } },
) {
  const user = req.nextUrl.searchParams.get("user");

  const userId = user ?? (await getValidatedUser());
  try {
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        playerBallEvents: {
          orderBy: { id: "asc" },
        },
        playerBatEvents: true,
      },
    });

    const playerBatEvents = (player?.playerBatEvents ?? [])
      .filter((event) => event.matchId !== null)
      .map((e) => ({
        ...e,
        matchId: e.matchId as string,
      }));

    const playerBallEvents = (player?.playerBallEvents ?? [])
      .filter((event) => event.matchId !== null)
      .map((e) => ({
        ...e,
        matchId: e.matchId as string,
      }));

    const battingEventsExtended = playerBatEvents.filter(
      (event) => event.batsmanId === id,
    );

    const bowlingEventsExtended = playerBallEvents.filter(
      (event) => event.bowlerId === id,
    );

    const groupedMatchesBat = mapGroupedMatches(battingEventsExtended);
    const groupedMatchesBowl = mapGroupedMatches(bowlingEventsExtended);

    //// Field Stats
    const catches = id
      ? await prisma.ballEvent.count({
          where: {
            userId,
            OR: [
              { AND: [{ type: "-1_4" }, { bowlerId: id }] },
              {
                AND: [
                  { type: { contains: id } },
                  {
                    OR: [{ type: { contains: "_3_" } }],
                  },
                ],
              },
            ],
          },
        })
      : 0;

    const runOuts = id
      ? await prisma.ballEvent.count({
          where: {
            AND: [{ type: { contains: "_5_" } }, { type: { contains: id } }],
          },
        })
      : 0;

    const stumpings = id
      ? await prisma.ballEvent.count({
          where: {
            AND: [{ type: { contains: "_6_" } }, { type: { contains: id } }],
          },
        })
      : 0;

    const fieldingStats: PlayerStats["fielding"] = {
      catches,
      runOuts,
      stumpings,
    };

    const milestones = calcMilestones(groupedMatchesBat);

    const { fives: fiveHauls, threes: threeHauls } =
      calcWicketHauls(groupedMatchesBowl);

    const playerBallEventsByMatches =
      Object.values(groupedMatchesBowl).map((events) =>
        events.map((event) => event.type as EventType),
      ) || [];

    const maidens = playerBallEventsByMatches.reduce(
      (acc, events) => acc + calculateMaidenOvers(events),
      0,
    );

    const bestSpell = calcBestSpells(playerBallEventsByMatches, 1)[0];

    const battingEvents = battingEventsExtended.map((event) => event.type);

    const {
      runs: runsScored,
      totalBalls: ballsFaced,
      wickets: outs,
    } = getScore({ balls: battingEvents, forBatsman: true });

    const noWicketEvents = battingEvents.filter(
      (event) => !event.includes("-1"),
    );

    const boundaries = runsScored
      ? noWicketEvents.filter(
          (event) => event.includes("4") || event.includes("6"),
        )
      : [];

    const dotsPlayed = noWicketEvents.filter((event) => event === "0").length;
    const singles = noWicketEvents.filter((event) => event === "1").length;
    const fours = boundaries.filter((event) => event.includes("4")).length;
    const sixes = boundaries.filter((event) => event.includes("6")).length;

    const boundaryRuns = boundaries.length ? calcRuns(boundaries, true) : 0;
    const boundaryRate = (boundaryRuns / runsScored) * 100 || 0;

    const battingStats: PlayerStats["batting"] = {
      runs: runsScored,
      balls: ballsFaced,
      wickets: outs,
      ...milestones,
      boundaryRate,
      dotsPlayed,
      singles,
      fours,
      sixes,
    };

    const bowlingEvents = playerBallEvents
      .filter((event) => event.bowlerId === id)
      .map((event) => event.type);

    const {
      runs: runsConceded,
      totalBalls: ballsBowled,
      wickets: wicketsTaken,
      extras,
      runRate,
    } = getScore({ balls: bowlingEvents, forBowler: true });

    const dotBalls = bowlingEvents.filter((event) => event === "0").length;
    // const dotBallsRate = (dotBalls / bowlingEvents.length) * 100 || 0;

    const hattricks = Object.values(groupedMatchesBowl)
      .map((events) =>
        countHatTricks(events.map((event) => event.type as string)),
      )
      .reduce((acc, curr) => acc + curr, 0);

    const bowlingStats: PlayerStats["bowling"] = {
      runs: runsConceded,
      balls: ballsBowled,
      wickets: wicketsTaken,
      maidens,
      // dotBallsRate,
      dotBalls,
      bestSpell,
      extras,
      economy: runRate,
      fiveHauls,
      threeHauls,
      hattricks,
    };

    const matchesPlayed = await prisma.match.count({
      where: {
        matchTeams: {
          some: { team: { teamPlayers: { some: { playerId: id } } } },
        },
      },
    });

    const playerStats: PlayerStats = {
      matchesPlayed,
      batting: battingStats,
      bowling: bowlingStats,
      fielding: fieldingStats,
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
