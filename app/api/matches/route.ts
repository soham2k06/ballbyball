import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";
import { createOrUpdateWithUniqueName, getValidatedUser } from "@/lib/utils";
import { createMatchSchema } from "@/lib/validation/match";
import { MatchExtended } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const userRef = req.nextUrl.searchParams.get("user");
    const userId = userRef ?? (await getValidatedUser());
    const size = req.nextUrl.searchParams.get("size") ?? "5";

    const [matches, count] = await Promise.all([
      prisma.match.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: parseInt(size),
        select: {
          id: true,
          name: true,
          hasEnded: true,
          overs: true,
          createdAt: true,
          curTeam: true,
          allowSinglePlayer: true,
          ballEvents: {
            select: { batsmanId: true, type: true },
            orderBy: { id: "asc" },
          },
          matchTeams: {
            orderBy: { batFirst: "desc" },
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                  teamPlayers: { select: { playerId: true } },
                },
              },
            },
          },
        },
      }),
      prisma.match.count({ where: { userId } }),
    ]);

    const simplified = matches.map((match) => {
      const teams = match.matchTeams.map((mt) => {
        const { teamPlayers, ...rest } = mt.team;
        return {
          playerIds: teamPlayers.map(({ playerId }) => playerId),
          batFirst: mt.batFirst,
          ...rest,
        };
      });
      // eslint-disable-next-line no-unused-vars
      const { matchTeams, ...rest } = match;
      return { ...rest, teams };
    });

    return NextResponse.json({ matches: simplified as MatchExtended[], count });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getValidatedUser();
    const body = await req.json();
    const parsed = createMatchSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const { name, teamIds, batFirst, overs, curPlayers, allowSinglePlayer } =
      parsed.data;
    const newName = await createOrUpdateWithUniqueName(name, prisma.match);
    const match = await prisma.match.create({
      data: {
        userId,
        name: newName,
        curPlayers,
        curTeam: 0,
        matchTeams: {
          createMany: {
            data: teamIds.map((teamId) => ({
              teamId,
              batFirst: teamId === batFirst,
            })),
          },
        },
        overs,
        allowSinglePlayer,
      },
    });
    await prisma.team.updateMany({
      where: { id: { in: teamIds } },
      data: { matchId: match.id },
    });
    return NextResponse.json({ id: match.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
