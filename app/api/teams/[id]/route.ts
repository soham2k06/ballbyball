import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";
import { createWithUniqueName, validateUser } from "@/lib/utils";
import { createTeamSchema } from "@/lib/validation/team";

export async function GET(
  _: any,
  { params: { id } }: { params: { id: string } },
) {
  try {
    validateUser();

    const team = await prisma.team.findFirst({
      where: { id },
      include: { teamPlayers: { include: { player: true } } },
    });

    const teamSimplified = {
      players: team?.teamPlayers.map((team) => team.player),
      ...team,
    };

    delete teamSimplified.teamPlayers;

    if (!team)
      return NextResponse.json({ error: "No data found" }, { status: 404 });

    return NextResponse.json(teamSimplified, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params: { id } }: { params: { id: string } },
) {
  try {
    const userId = validateUser();

    const body = await req.json();
    const parsedRes = createTeamSchema.safeParse(body);

    if (!parsedRes.success) {
      console.error(parsedRes.error);
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { name, playerIds, captain } = parsedRes.data;

    const team = await prisma.team.findFirst({
      where: { id },
      include: { teamPlayers: true },
    });

    if (!team)
      return NextResponse.json({ error: "Team not found" }, { status: 404 });

    if (team.userId !== userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const newName = await createWithUniqueName(name, prisma.team);

    await prisma.team.update({
      where: { id },
      data: {
        name: newName,
        teamPlayers: {
          deleteMany: {},
          create: playerIds.map((playerId: string) => ({
            player: { connect: { id: playerId } },
          })),
        },
        captain,
      },
      include: { teamPlayers: { include: { player: true } } },
    });

    return NextResponse.json({ message: "Team updated" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _: any,
  { params: { id } }: { params: { id: string } },
) {
  try {
    validateUser();

    await prisma.teamPlayer.deleteMany({ where: { teamId: id } });
    await prisma.team.delete({ where: { id } });

    return NextResponse.json({ messaged: "Team deleted" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
