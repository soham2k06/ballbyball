import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";
import { validateUser } from "@/lib/utils";
import { updateMatchPlayersSchema } from "@/lib/validation/match";

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

export async function PUT(
  req: NextRequest,
  { params: { id } }: { params: { id: string } },
) {
  try {
    validateUser();

    const body = await req.json();
    const parsedRes = updateMatchPlayersSchema.safeParse(body);

    if (!parsedRes.success) {
      console.error("Error Parsing JSON ----->", parsedRes.error);
      return NextResponse.json({ error: "Invalid inputs" }, { status: 422 });
    }

    const { curPlayers } = parsedRes.data;

    if (!id)
      return NextResponse.json({ error: "Match not found" }, { status: 400 });

    const curPlayersToSave = curPlayers.filter((player) => player);

    const updatedMatch = await prisma.match.update({
      where: { id },
      data: { curPlayers: curPlayersToSave },
    });

    return NextResponse.json({ match: updatedMatch }, { status: 200 });
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
