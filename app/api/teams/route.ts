import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";
import { createOrUpdateWithUniqueName, getValidatedUser } from "@/lib/utils";
import { createTeamSchema } from "@/lib/validation/team";
import { TeamWithPlayers } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const userRef = req.nextUrl.searchParams.get("user");
    const userId = userRef ?? (await getValidatedUser());
    const teams = await prisma.team.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        captain: true,
        teamPlayers: {
          select: { player: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    const simplified = teams.map(({ teamPlayers, ...rest }) => ({
      ...rest,
      players: teamPlayers.map((tp) => tp.player),
    }));
    return NextResponse.json(simplified as TeamWithPlayers[]);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getValidatedUser();
    const body = await req.json();
    const parsed = createTeamSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const { name, playerIds, captain } = parsed.data;
    const newName = await createOrUpdateWithUniqueName(name, prisma.team);
    await prisma.team.create({
      data: {
        matchId: null,
        userId,
        name: newName,
        teamPlayers: {
          create: playerIds
            .reverse()
            .map((playerId) => ({ player: { connect: { id: playerId } } })),
        },
        ...(captain && { captain }),
      },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
