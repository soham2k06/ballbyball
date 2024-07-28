import { NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";
import { validateUser } from "@/lib/utils";

export async function GET(
  _: unknown,
  { params: { id } }: { params: { id: string } },
) {
  try {
    const userId = validateUser();

    const match = await prisma.match.findFirst({
      where: { userId, id },
      include: {
        ballEvents: { select: { batsmanId: true, bowlerId: true, type: true } },
        matchTeams: {
          select: {
            team: {
              select: {
                id: true,
                name: true,
                teamPlayers: {
                  select: { player: { select: { id: true, name: true } } },
                },
              },
            },
          },
        },
      },
    });

    const matchSimplified = {
      teams: match?.matchTeams.map((team) => {
        const { teamPlayers, ...rest } = team.team;
        return {
          ...rest,
          players: teamPlayers.map((teamPlayer) => teamPlayer.player),
        };
      }),
      ...match,
    };

    delete matchSimplified.matchTeams;

    if (!match)
      return NextResponse.json({ error: "No data found" }, { status: 404 });

    return NextResponse.json(matchSimplified, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
