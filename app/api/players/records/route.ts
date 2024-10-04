import { NextRequest, NextResponse } from "next/server";

import { endOfDay, startOfDay } from "date-fns";

import prisma from "@/lib/db/prisma";
import {
  calcBestSpells,
  calcMilestones,
  calculateMaidenOvers,
  calcWicketHauls,
  getScore,
  getValidatedUser,
  mapGroupedMatches,
} from "@/lib/utils";
import {
  BattingRecordsType,
  BowlingRecordsType,
  EventType,
  PlayerPerformance,
} from "@/types";

export async function GET(req: NextRequest) {
  const userRef = req.nextUrl.searchParams.get("user");
  const date = req.nextUrl.searchParams.get("date");
  const recordType = req.nextUrl.searchParams.get("recordType");

  if (!recordType)
    return NextResponse.json({ error: "Invalid record type" }, { status: 400 });

  const userId = userRef ?? (await getValidatedUser());

  const ballEventsFilter = date
    ? {
        Match: {
          createdAt: {
            gte: startOfDay(new Date(date)),
            lte: endOfDay(new Date(date)),
          },
        },
      }
    : {};

  try {
    const players = await prisma.player.findMany({
      where: { userId },
      include: {
        playerBallEvents: {
          where: ballEventsFilter,
          orderBy: { id: "asc" },
        },
        playerBatEvents: {
          where: ballEventsFilter,
        },
      },
    });

    const playerStats = await Promise.all(
      players.map(async (player) => {
        const [catches, runOuts, stumpings] =
          recordType === "mvp"
            ? await Promise.all([
                prisma.ballEvent.count({
                  where: {
                    userId,
                    ...ballEventsFilter,
                    OR: [
                      { AND: [{ type: "-1_4" }, { bowlerId: player.id }] },
                      {
                        AND: [
                          { type: { contains: player.id } },
                          {
                            OR: [{ type: { contains: "_3_" } }],
                          },
                        ],
                      },
                    ],
                  },
                }),
                prisma.ballEvent.count({
                  where: {
                    userId,
                    ...ballEventsFilter,
                    AND: [
                      { type: { contains: "_5_" } },
                      { type: { contains: player.id } },
                    ],
                  },
                }),
                prisma.ballEvent.count({
                  where: {
                    userId,
                    ...ballEventsFilter,
                    AND: [
                      { type: { contains: "_6_" } },
                      { type: { contains: player.id } },
                    ],
                  },
                }),
              ])
            : [0, 0, 0];

        return {
          ...player,
          catches,
          runOuts,
          stumpings,
        };
      }),
    );

    const filteredPlayers = playerStats.filter(
      (player) =>
        player.playerBatEvents.length > 0 || player.playerBallEvents.length > 0,
    );

    let result: (
      | BattingRecordsType
      | BowlingRecordsType
      | PlayerPerformance
    )[] = [];

    if (recordType === "batting") {
      result = filteredPlayers
        .map((player) => {
          const groupedMatches = mapGroupedMatches([
            ...player?.playerBatEvents,
            ...player?.playerBallEvents,
          ]);
          const groupedInnings = mapGroupedMatches(
            player?.playerBatEvents ?? [],
          );
          const innings = Object.keys(groupedInnings).length;
          const batEvents = (player?.playerBatEvents).map(
            (event) => event.type,
          );

          const milestones = calcMilestones(groupedInnings);

          const {
            runs,
            totalBalls: ballsFaced,
            wickets,
          } = getScore({
            balls: batEvents,
            forBatsman: true,
          });

          const average = runs / wickets || 0;
          const strikeRate = (runs / ballsFaced) * 100 || 0;

          const noWicketEvents = batEvents.filter(
            (event) => !event.includes("-1"),
          );
          const fours = noWicketEvents.filter((event) =>
            event.includes("4"),
          ).length;
          const sixes = noWicketEvents.filter((event) =>
            event.includes("6"),
          ).length;

          const notOuts = Object.values(groupedInnings).reduce(
            (acc, events) => {
              const isNotOut = !events.some((evt) => evt.type.includes("-1"));
              return isNotOut ? acc + 1 : acc;
            },
            0,
          );

          return {
            player: {
              id: player.id,
              name: player.name,
            },
            runs,
            ballsFaced,
            matches: Object.keys(groupedMatches).length,
            innings,
            milestones,
            average,
            strikeRate,
            notOuts,
            fours,
            sixes,
          };
        })
        .sort(
          (a, b) =>
            b.runs - a.runs ||
            b.strikeRate - a.strikeRate ||
            b.innings - a.innings ||
            b.matches - a.matches,
        )
        .slice(0, 10);
    }

    if (recordType === "bowling") {
      result = filteredPlayers
        .map((player) => {
          const groupedMatches = mapGroupedMatches([
            ...player?.playerBatEvents,
            ...player?.playerBallEvents,
          ]);

          const groupedMatchesBowl = mapGroupedMatches(player.playerBallEvents);

          const bowlEvents = (player?.playerBallEvents ?? []).map(
            (event) => event.type as EventType,
          );

          const bowlEventsByMatches =
            Object.values(groupedMatchesBowl).map((events) =>
              events.map((event) => event.type as EventType),
            ) || [];

          const bestSpell = calcBestSpells(bowlEventsByMatches, 1)[0];

          const { threes: threeHauls, fives: fiveHauls } =
            calcWicketHauls(groupedMatchesBowl);

          const maidens = bowlEventsByMatches.reduce(
            (acc, events) => acc + calculateMaidenOvers(events),
            0,
          );

          const {
            runs: runsConceded,
            totalBalls,
            wickets,
            runRate,
          } = getScore({ balls: bowlEvents, forBowler: true });

          const dots = bowlEvents.filter((event) => event === "0").length;

          const strikeRate = wickets ? totalBalls / wickets || 0 : 0;

          return {
            player: {
              id: player.id,
              name: player.name,
            },
            wickets,
            totalBalls,
            matches: Object.keys(groupedMatches).length,
            economy: runRate,
            strikeRate,
            maidens,
            threeHauls,
            fiveHauls,
            bestSpell,
            runsConceded,
            dots,
          };
        })
        .sort((a, b) => {
          return a.matches === 0 && b.matches === 0
            ? 0
            : a.matches === 0
              ? 1
              : b.matches === 0
                ? -1
                : b.wickets - a.wickets ||
                  a.economy - b.economy ||
                  a.matches - b.matches;
        })
        .slice(0, 10);
    }

    if (recordType === "mvp") {
      result = filteredPlayers.map((player) => {
        const groupedMatchesBat = mapGroupedMatches(player.playerBatEvents);
        const batEvents = (player.playerBatEvents ?? []).map(
          (event) => event.type as EventType,
        );

        const groupedMatches = mapGroupedMatches([
          ...player?.playerBatEvents,
          ...player?.playerBallEvents,
        ]);

        const noWicketEvents = batEvents.filter(
          (event) => !event.includes("-1"),
        );

        const { runs: runsScored, totalBalls: ballsFaced } = getScore({
          balls: batEvents,
          forBatsman: true,
        });

        const strikeRate = runsScored ? (runsScored / ballsFaced) * 100 : 0;

        const { thirties, fifties, centuries } =
          calcMilestones(groupedMatchesBat);

        const boundaries = runsScored
          ? noWicketEvents.filter(
              (event) => event.includes("4") || event.includes("6"),
            )
          : [];

        const fours = boundaries.filter((event) => event.includes("4")).length;
        const sixes = boundaries.filter((event) => event.includes("6")).length;

        //// Bowl Stats
        const bowlEvents = (player?.playerBallEvents ?? []).map(
          (event) => event.type as EventType,
        );

        const bowlEventsByMatches = Object.values(
          mapGroupedMatches(player?.playerBallEvents ?? []),
        ).map((events) => events.map((event) => event.type as EventType));

        const maidens = bowlEventsByMatches.reduce((acc, events) => {
          const maidensForMatch = calculateMaidenOvers(events);
          return acc + maidensForMatch;
        }, 0);

        const {
          runs: runConceded,
          totalBalls: ballsBowled,
          wickets,
          runRate: economy,
        } = getScore({ balls: bowlEvents, forBowler: true });

        return {
          name: player.name,
          playerId: player.id,
          // Bat
          runsScored,
          ballsFaced,
          strikeRate,
          fours,
          sixes,
          thirties,
          fifties,
          centuries,
          is2: false,
          is3: false,
          isDuck: false,
          // Bowl
          wicketsTaken: wickets,
          ballsBowled,
          runConceded,
          economy,
          maidens,
          // Field
          catches: player.catches,
          runOuts: player.runOuts,
          stumpings: player.stumpings,
          // Other
          team: "",
          isWinner: false,
          matches: Object.keys(groupedMatches).length,
        };
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
