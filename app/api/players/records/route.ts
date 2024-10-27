import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";
import { getValidatedUser } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const userRef = req.nextUrl.searchParams.get("user");

  const userId = userRef ?? (await getValidatedUser());

  try {
    const players = await prisma.player.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,

        playerBallEvents: {
          select: {
            Match: {
              select: {
                createdAt: true,
              },
            },
            batsmanId: true,
            bowlerId: true,
            type: true,
            matchId: true,
          },
          orderBy: { id: "asc" },
        },
        playerBatEvents: {
          select: {
            Match: {
              select: {
                createdAt: true,
              },
            },
            batsmanId: true,
            bowlerId: true,
            type: true,
            matchId: true,
          },
          orderBy: { id: "asc" },
        },
      },
    });

    const playerStats = await Promise.all(
      players.map(async (player) => {
        const playerFieldEvents = await prisma.ballEvent.findMany({
          where: {
            OR: [
              {
                type: {
                  contains: `-1_3_${player.id}`, // Catches
                },
              },
              {
                type: {
                  contains: `-1_6_${player.id}`, // Stumpings
                },
              },
              {
                type: {
                  contains: `-1_5_${player.id}`, // Runouts
                },
              },
              {
                AND: [
                  {
                    type: {
                      contains: `-1_4`, // Caught and Bowled
                    },
                  },
                  {
                    bowlerId: player.id,
                  },
                ],
              },
            ],
          },
          select: {
            Match: { select: { createdAt: true } },
            type: true,
          },
        });

        return {
          ...player,
          playerFieldEvents,
        };
      }),
    );

    return NextResponse.json(playerStats);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
