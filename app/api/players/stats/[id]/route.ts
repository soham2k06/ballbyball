import prisma from "@/lib/db/prisma";
import {
  calcBestSpells,
  calcMilestones,
  calcRuns,
  calcWicketHauls,
  getScore,
  getValidatedUser,
  mapGroupedMatches,
} from "@/lib/utils";
import { EventType, PlayerStats } from "@/types";
import { NextResponse } from "next/server";

export async function GET(
  _: unknown,
  { params: { id } }: { params: { id: string } },
) {
  const userId = await getValidatedUser();
  try {
    const player = await prisma.player.findUnique({
      where: { id },
      include: { playerBallEvents: true, playerBatEvents: true },
    });

    const playerBallEvents = player?.playerBallEvents ?? [];

    const battingEventsExtended =
      player?.playerBatEvents.filter((event) => event.batsmanId === id) ?? [];

    const bowlingEventsExtended =
      player?.playerBallEvents.filter((event) => event.bowlerId === id) ?? [];

    const groupedMatchesBat = mapGroupedMatches(battingEventsExtended);
    const groupedMatchesBowl = mapGroupedMatches(bowlingEventsExtended);

    const playerFieldEvents = player
      ? await prisma.ballEvent.findMany({
          where: {
            userId,
            OR: [
              { AND: [{ type: "-1_4" }, { bowlerId: player.id }] },
              {
                AND: [
                  { type: { contains: player.id } },
                  {
                    OR: [
                      { type: { contains: "_3_" } },
                      { type: { contains: "_5_" } },
                      { type: { contains: "_6_" } },
                    ],
                  },
                ],
              },
            ],
          },
        })
      : [];

    const catches = playerFieldEvents.filter(
      (event) => event.type.includes("_3_") || event.type === "-1_4",
    );
    const runOuts = playerFieldEvents.filter((event) =>
      event.type.includes("_5_"),
    );
    const stumpings = playerFieldEvents.filter((event) =>
      event.type.includes("_6_"),
    );

    const fieldingStats = {
      catches: catches.length,
      runOuts: runOuts.length,
      stumpings: stumpings.length,
    };

    const { thirties, fifties, centuries, highestScore, isNotout } =
      calcMilestones(groupedMatchesBat);

    const { fives: fiveHauls, threes: threeHauls } =
      calcWicketHauls(groupedMatchesBowl);

    const playerBallEventsByMatches =
      Object.values(groupedMatchesBowl).map((events) =>
        events.map((event) => event.type as EventType),
      ) || [];

    const bestSpell = calcBestSpells(playerBallEventsByMatches, 1)[0];

    const battingEvents = battingEventsExtended.map((event) => event.type);

    const {
      runs: runsScored,
      totalBalls: ballsFaced,
      wickets: outs,
    } = getScore({ balls: battingEvents, forBatsman: true });

    const noWicketEvents = battingEvents.filter(
      (event) => !event.includes("-1") && !event.includes("-4"),
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

    const battingStats = {
      runs: runsScored,
      balls: ballsFaced,
      wickets: outs,
      fifties,
      centuries,
      thirties,
      highestScore,
      boundaryRate,
      dotsPlayed,
      singles,
      fours,
      sixes,
      isNotoutOnHighestScore: isNotout,
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
    const dotBallsRate = (dotBalls / bowlingEvents.length) * 100 || 0;

    const bowlingStats = {
      runs: runsConceded,
      balls: ballsBowled,
      wickets: wicketsTaken,
      dotBallsRate,
      dotBalls,
      bestSpell,
      extras,
      economy: runRate,
      fiveHauls,
      threeHauls,
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
