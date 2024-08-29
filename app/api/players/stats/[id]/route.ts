import prisma from "@/lib/db/prisma";
import {
  calcBestSpells,
  calcMilestones,
  calcRuns,
  calculateMaidenOvers,
  calcWicketHauls,
  getScore,
  mapGroupedMatches,
} from "@/lib/utils";
import { EventType } from "@/types";
import { NextResponse } from "next/server";

export async function GET(
  _: unknown,
  { params: { id } }: { params: { id: string } },
) {
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

    const { fifties, centuries, highestScore, isNotout } =
      calcMilestones(groupedMatchesBat);

    const { fives: fiveHauls, threes: threeHauls } =
      calcWicketHauls(groupedMatchesBowl);

    const playerBallEventsByMatches =
      Object.values(groupedMatchesBowl).map((events) =>
        events.map((event) => event.type as EventType),
      ) || [];

    const bestSpell = calcBestSpells(playerBallEventsByMatches)[0];

    const battingEvents = battingEventsExtended.map((event) => event.type);

    const {
      runs: runsScored,
      totalBalls: ballsFaced,
      wickets: outs,
    } = getScore(battingEvents, true);

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
    const twos = noWicketEvents.filter((event) => event === "2").length;
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
      highestScore,
      boundaryRate,
      dotsPlayed,
      singles,
      twos,
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
    } = getScore(bowlingEvents);

    const maidenOverCount = calculateMaidenOvers(bowlingEvents as EventType[]);

    const dotBalls = bowlingEvents.filter((event) => event === "0").length;
    const dotBallsRate = (dotBalls / bowlingEvents.length) * 100 || 0;

    const bowlingStats = {
      runs: runsConceded,
      balls: ballsBowled,
      wickets: wicketsTaken,
      maidenOvers: maidenOverCount,
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

    const playerStats = {
      matchesPlayed,
      batting: battingStats,
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
