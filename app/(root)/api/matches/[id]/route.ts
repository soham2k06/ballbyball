import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/db/prisma";

export async function GET(
  _: unknown,
  { params: { id } }: { params: { id: string } },
) {
  try {
    const { userId } = auth();
    if (!userId) throw new Error("User not authenticated");

    const match = await prisma.match.findFirst({
      where: { id },
      include: {
        ballEvents: true,
        matchTeams: { include: { team: { include: { teamPlayers: true } } } },
      },
    });

    const matchSimplified = {
      teams: match?.matchTeams.map((team) => team.team),
      ...match,
    };

    delete matchSimplified.matchTeams;

    return NextResponse.json(matchSimplified, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
