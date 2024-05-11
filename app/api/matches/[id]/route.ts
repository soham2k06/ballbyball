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
      select: {
        allowSinglePlayer: true,
        curPlayers: true,
        curTeam: true,
        hasEnded: true,
        id: true,
        name: true,
        overs: true,
        strikeIndex: true,
        ballEvents: {
          select: { batsmanId: true, bowlerId: true, type: true },
        },
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
