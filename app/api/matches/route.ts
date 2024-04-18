import { NextRequest, NextResponse } from "next/server";
import { CurPlayer } from "@prisma/client";

import prisma from "@/lib/db/prisma";
import { createMatchSchema, updateMatchSchema } from "@/lib/validation/match";
import { createWithUniqueName, validateUser } from "@/lib/utils";

export async function GET() {
  try {
    const userId = validateUser();

    const matches = await prisma.match.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        ballEvents: { select: { batsmanId: true, type: true } },
        matchTeams: {
          include: {
            team: {
              select: {
                id: true,
                name: true,
                teamPlayers: { select: { playerId: true } },
              },
            },
          },
        },
      },
    });

    const matchesSimplified = matches.map((match) => {
      const teams = match.matchTeams.map((matchTeam) => {
        const { teamPlayers, ...teamWithoutPlayers } = matchTeam.team;
        return {
          playerIds: matchTeam.team.teamPlayers.map(({ playerId }) => playerId),
          ...teamWithoutPlayers,
        };
      });

      const { matchTeams, ...matchWithoutMatchTeams } = match;

      return { ...matchWithoutMatchTeams, teams };
    });

    if (!matches)
      return NextResponse.json({ error: "No data found" }, { status: 404 });

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
    const userId = validateUser();

    const body = await req.json();
    const parsedRes = createMatchSchema.safeParse(body);

    if (!parsedRes.success) {
      console.error("Error Parsing JSON ----->", parsedRes.error);
      return NextResponse.json({ error: "Invalid inputs" });
    }

    const { name, teamIds, curTeam, overs, curPlayers, allowSinglePlayer } =
      parsedRes.data;

    const newName = await createWithUniqueName(name, prisma.team);

    const match = await prisma.match.create({
      data: {
        userId,
        name: newName,
        matchTeams: {
          create: teamIds.reverse().map((teamId) => ({
            team: { connect: { id: teamId } },
          })),
        },
        curPlayers,
        curTeam: curTeam ?? 0,
        overs,
        allowSinglePlayer,
      },
      include: {
        matchTeams: { include: { team: true } },
        ballEvents: true,
      },
    });

    await prisma.team.updateMany({
      where: { id: { in: teamIds } },
      data: { matchId: match.id },
    });

    return NextResponse.json(match, { status: 201 });
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

    const {
      id: matchId,
      curPlayers,
      curTeam,
      name,
      overs,
      strikeIndex,
      hasEnded,
    } = parsedRes.data;

    if (!matchId)
      return NextResponse.json({ error: "Match not found" }, { status: 400 });

    const newName = await createWithUniqueName(name ?? "", prisma.match);

    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        name: newName || name,
        overs,
        curPlayers: curPlayers as CurPlayer[],
        curTeam,
        strikeIndex,
        hasEnded,
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
