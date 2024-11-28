import { NextRequest, NextResponse } from "next/server";

import { endOfDay, startOfDay } from "date-fns";

import prisma from "@/lib/db/prisma";
import { getValidatedUser } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const userRef = params.get("user");
  const numMatches = params.get("matches");
  const date = params.get("date");

  const userId = userRef ?? (await getValidatedUser());

  try {
    const matches = await prisma.match.findMany({
      where: {
        userId,
        createdAt: {
          gte: date ? startOfDay(new Date(date ?? Date.now())) : undefined,
          lte: date ? endOfDay(new Date(date ?? Date.now())) : undefined,
        },
      },
      orderBy: { createdAt: "desc" },
      take: numMatches !== "all" ? parseInt(numMatches as string) : undefined,
      select: {
        id: true,
        createdAt: true,
        ballEvents: {
          select: {
            matchId: true,
            id: true,
            batsman: { select: { id: true, name: true } },
            bowler: { select: { id: true, name: true } },
            type: true,
          },
        },
      },
    });

    const getPlayers = (dataArr: (typeof matches)[0][]) => {
      const players = new Map();

      dataArr.forEach((data) => {
        data.ballEvents.forEach((event) => {
          const { batsman, bowler } = event;

          // Add batsman
          if (!players.has(batsman.id)) {
            players.set(batsman.id, {
              id: batsman.id,
              name: batsman.name,
              playerBatEvents: [],
              playerBallEvents: [],
              playerFieldEvents: [],
            });
          }

          // Add bowler
          if (!players.has(bowler.id)) {
            players.set(bowler.id, {
              id: bowler.id,
              name: bowler.name,
              playerBatEvents: [],
              playerBallEvents: [],
              playerFieldEvents: [],
            });
          }

          const eventSemi = {
            id: event.id,
            type: event.type,
            matchId: event.matchId,
          };
          // Push events to respective arrays
          players.get(batsman.id).playerBatEvents.push(eventSemi);
          players.get(bowler.id).playerBallEvents.push(eventSemi);
        });
      });

      dataArr.forEach((data) => {
        data.ballEvents.forEach((event) => {
          const { type } = event;

          // Check if type contains any player ID for fielding events
          players.forEach((player, playerId) => {
            if (type.includes(playerId)) {
              player.playerFieldEvents.push({
                id: event.id,
                type: event.type,
                matchId: event.matchId,
              });
            }
          });
        });
      });

      // Convert Map values to an array
      return Array.from(players.values());
    };

    const players = getPlayers(matches);

    // const players = await prisma.player.findMany({
    //   where: { userId },
    //   select: {
    //     id: true,
    //     name: true,

    //     playerBallEvents: {
    //       select: {
    //         Match: {
    //           select: {
    //             createdAt: true,
    //           },
    //         },
    //         batsmanId: true,
    //         bowlerId: true,
    //         type: true,
    //         matchId: true,
    //       },
    //       orderBy: { id: "asc" },
    //     },
    //     playerBatEvents: {
    //       select: {
    //         Match: {
    //           select: {
    //             createdAt: true,
    //           },
    //         },
    //         batsmanId: true,
    //         bowlerId: true,
    //         type: true,
    //         matchId: true,
    //       },
    //       orderBy: { id: "asc" },
    //     },
    //   },
    // });

    // const playerStats = await Promise.all(
    //   players.map(async (player) => {
    //     const playerFieldEvents = await prisma.ballEvent.findMany({
    //       where: {
    //         OR: [
    //           {
    //             type: {
    //               contains: `-1_3_${player.id}`, // Catches
    //             },
    //           },
    //           {
    //             type: {
    //               contains: `-1_6_${player.id}`, // Stumpings
    //             },
    //           },
    //           {
    //             type: {
    //               contains: `-1_5_${player.id}`, // Runouts
    //             },
    //           },
    //           {
    //             AND: [
    //               {
    //                 type: {
    //                   contains: `-1_4`, // Caught and Bowled
    //                 },
    //               },
    //               {
    //                 bowlerId: player.id,
    //               },
    //             ],
    //           },
    //         ],
    //       },
    //       select: {
    //         Match: { select: { createdAt: true } },
    //         type: true,
    //       },
    //     });

    //     return {
    //       ...player,
    //       playerFieldEvents,
    //     };
    //   }),
    // );

    return NextResponse.json(players);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
