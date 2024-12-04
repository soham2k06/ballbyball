import { NextRequest, NextResponse } from "next/server";

import { endOfDay, startOfDay } from "date-fns";

import prisma from "@/lib/db/prisma";
import { getPlayersFromMatches, getValidatedUser } from "@/lib/utils";

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
          orderBy: { id: "asc" },
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

    const players = await getPlayersFromMatches(matches);

    return NextResponse.json(players);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
