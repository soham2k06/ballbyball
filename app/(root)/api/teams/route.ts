import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/db/prisma";
import { createTeamSchema } from "@/lib/validation/team";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) throw new Error("User not authenticated");

    const players = await prisma.team.findMany({
      where: { userId },
      include: { teamPlayers: { include: { player: true } } },
    });

    const playersSimplified = players.map((player) => {
      const players = player.teamPlayers.map((teamPlayer) => teamPlayer.player);

      const { teamPlayers, ...playerWithoutTeamPlayers } = player;

      return { ...playerWithoutTeamPlayers, players };
    });

    return NextResponse.json(playersSimplified, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedRes = createTeamSchema.safeParse(body);

    if (!parsedRes.success) {
      console.error(parsedRes.error);
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { name, playerIds, captain } = parsedRes.data;

    const { userId } = auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const team = await prisma.team.create({
      data: {
        userId,
        name,
        teamPlayers: {
          create: playerIds.map((playerId: string) => ({
            player: { connect: { id: playerId } },
          })),
        },
        captain,
      },
      include: { teamPlayers: true },
    });
    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
