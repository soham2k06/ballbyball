import { NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";

export async function GET(
  _: any,
  { params: { id } }: { params: { id: string } },
) {
  try {
    const team = await prisma.team.findFirst({
      where: { id },
      select: {
        teamPlayers: {
          select: {
            player: { select: { id: true } },
          },
        },
      },
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
