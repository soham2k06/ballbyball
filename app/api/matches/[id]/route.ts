import { NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";
import { validateUser } from "@/lib/utils";

export async function GET(
  _: unknown,
  { params: { id } }: { params: { id: string } },
) {
  try {
    validateUser();

    const match = await prisma.match.findFirst({
      where: { id },
      include: {
        ballEvents: true,
        matchTeams: {
          include: {
            team: { include: { teamPlayers: { include: { player: true } } } },
          },
        },
      },
    });

    const matchSimplified = {
      teams: match?.matchTeams
        .map((team) => {
          const { teamPlayers, ...rest } = team.team;
          return {
            ...rest,
            players: teamPlayers.map((teamPlayer) => teamPlayer.player),
          };
        })
        .reverse(),
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

export async function DELETE(
  _: any,
  { params: { id } }: { params: { id: string } },
) {
  try {
    validateUser();

    await prisma.matchTeam.deleteMany({ where: { matchId: id } });
    await prisma.ballEvent.deleteMany({ where: { matchId: id } });
    await prisma.match.delete({ where: { id } });

    return NextResponse.json({ message: "Match deleted" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
