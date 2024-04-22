import { NextResponse, NextRequest } from "next/server";

import prisma from "@/lib/db/prisma";
import { createTeamSchema } from "@/lib/validation/team";
import { createOrUpdateWithUniqueName, validateUser } from "@/lib/utils";

export async function GET() {
  try {
    const userId = validateUser();

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
    });

    const teamsSimplified = teams.map((team) => {
      const players = team.teamPlayers.map((teamPlayer) => teamPlayer.player);

      const { teamPlayers, ...playerWithoutTeamPlayers } = team;

      return { ...playerWithoutTeamPlayers, players };
    });

    if (!teams)
      return NextResponse.json({ error: "No data found" }, { status: 404 });

    return NextResponse.json(teamsSimplified, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = validateUser();

    const body = await req.json();
    const parsedRes = createTeamSchema.safeParse(body);

    if (!parsedRes.success) {
      console.error(parsedRes.error);
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { name, playerIds, captain } = parsedRes.data;

    const newName = await createOrUpdateWithUniqueName(name, prisma.team);

    await prisma.team.create({
      data: {
        userId,
        name: newName,
        teamPlayers: {
          create: playerIds.reverse().map((playerId: string) => ({
            player: { connect: { id: playerId } },
          })),
        },
        ...(captain && { captain }),
      },
    });

    return NextResponse.json({ message: "success" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
