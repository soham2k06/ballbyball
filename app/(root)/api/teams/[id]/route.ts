import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/db/prisma";
import { toast } from "sonner";

export async function GET(
  _: any,
  { params: { id } }: { params: { id: string } },
) {
  try {
    const { userId } = auth();

    if (!userId) {
      toast.error("User Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const team = await prisma.team.findFirst({
      where: { id },
      include: { teamPlayers: { include: { player: true } } },
    });

    const teamSimplified = {
      players: team?.teamPlayers.map((team) => team.player),
      ...team,
    };

    delete teamSimplified.teamPlayers;

    return NextResponse.json(teamSimplified, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
