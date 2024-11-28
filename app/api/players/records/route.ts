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

          // Batsman
          if (!players.has(batsman.id)) {
            players.set(batsman.id, {
              id: batsman.id,
              name: batsman.name,
              playerBatEvents: [],
              playerBallEvents: [],
              playerFieldEvents: [],
            });
          }

          // Bowler
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
          players.get(batsman.id).playerBatEvents.push(eventSemi);
          players.get(bowler.id).playerBallEvents.push(eventSemi);
        });
      });

      dataArr.forEach((data) => {
        data.ballEvents.forEach((event) => {
          const { type } = event;

          players.forEach((player, playerId) => {
            if (
              type.includes(playerId) ||
              (type === "-1_4" && playerId === event.bowler.id)
            ) {
              player.playerFieldEvents.push({
                id: event.id,
                type: event.type,
                matchId: event.matchId,
              });
            }
          });
        });
      });

      return Array.from(players.values());
    };

    const players = getPlayers(matches);

    return NextResponse.json(players);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
