import { NextRequest, NextResponse } from "next/server";
import { CurPlayer } from "@prisma/client";

import prisma from "@/lib/db/prisma";
import { createMatchSchema, updateMatchSchema } from "@/lib/validation/match";
import { validateUser } from "@/lib/utils";

export async function GET() {
  try {
    const userId = validateUser();

    const matches = await prisma.match.findMany({
      where: { userId },
      include: {
        ballEvents: true,
        matchTeams: { include: { team: { include: { teamPlayers: true } } } },
      },
    });

    const matchesSimplified = matches.map((match) => {
      const teams = match.matchTeams
        .map((matchTeam) => matchTeam.team)
        .reverse();

      const { matchTeams, ...matchWithoutMatchTeams } = match;

      return { ...matchWithoutMatchTeams, teams };
    });

    return NextResponse.json(matchesSimplified, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedRes = createMatchSchema.safeParse(body);

    if (!parsedRes.success) {
      console.error("Error Parsing JSON ----->", parsedRes.error);
      return NextResponse.json({ error: "Invalid inputs" });
    }

    const { name, teamIds, curTeam, overs, curPlayers } = parsedRes.data;

    const userId = validateUser();

    const match = await prisma.match.create({
      data: {
        userId,
        name,
        matchTeams: {
          create: teamIds.map((teamId) => ({
            team: { connect: { id: teamId } },
          })),
        },
        curPlayers,
        curTeam: curTeam ?? 0,
        overs,
      },
      include: {
        matchTeams: { include: { team: true } },
        ballEvents: true,
      },
    });

    await prisma.team.updateMany({
      where: { id: { in: teamIds } },
      data: {
        matchId: match.id,
      },
    });

    return NextResponse.json({ match }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    validateUser();

    const body = await req.json();
    const parsedRes = updateMatchSchema.safeParse(body);

    if (!parsedRes.success) {
      console.error("Error Parsing JSON ----->", parsedRes.error);
      return NextResponse.json({ error: "Invalid inputs" }, { status: 422 });
    }

    const { id: matchId, curPlayers, curTeam, name, overs } = parsedRes.data;

    if (!matchId) {
      return NextResponse.json({ error: "Match not found" }, { status: 400 });
    }

    const curPlayersToSave = curPlayers?.filter(
      (player) => player,
    ) as CurPlayer[];

    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        name,
        overs,
        curPlayers: curPlayersToSave,
        curTeam,
      },
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