import { NextRequest, NextResponse } from "next/server";

import { CurPlayer } from "@prisma/client";

import prisma from "@/lib/db/prisma";
import { createOrUpdateWithUniqueName, getValidatedUser } from "@/lib/utils";
import { updateMatchSchema } from "@/lib/validation/match";
import { MatchExtended } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userRef = req.nextUrl.searchParams.get("user");
    const userId = userRef ?? (await getValidatedUser());
    const { id } = await params;
    const raw = await prisma.match.findFirst({
      where: { userId, id },
      include: {
        ballEvents: {
          select: { batsmanId: true, bowlerId: true, type: true },
          orderBy: { id: "asc" },
        },
        matchTeams: {
          orderBy: { batFirst: "desc" },
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

    if (!raw)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { matchTeams, ...rest } = raw;
    const match = {
      ...rest,
      teams: matchTeams.map(({ team }) => {
        const { teamPlayers, ...teamRest } = team;
        return {
          ...teamRest,
          players: teamPlayers.map((tp) => tp.player),
        };
      }),
    };
    return NextResponse.json(match as unknown as MatchExtended);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await getValidatedUser();
    const { id: matchId } = await params;
    const body = await req.json();

    const dataWithSortedCurPlayers = {
      ...body,
      id: matchId,
      curPlayers: body.curPlayers?.sort((a: CurPlayer, b: CurPlayer) =>
        (a?.type || "batsman").localeCompare(b?.type || "batsman"),
      ),
    };

    const parsed = updateMatchSchema.safeParse(dataWithSortedCurPlayers);
    if (!parsed.success)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const {
      curPlayers,
      name,
      overs,
      batFirst,
      strikeIndex,
      hasEnded,
      allowSinglePlayer,
      curTeam,
    } = parsed.data;

    const newName = await createOrUpdateWithUniqueName(
      name ?? "",
      prisma.match,
      matchId,
    );

    if (batFirst) {
      await prisma.matchTeam.updateMany({
        where: { matchId, batFirst: true },
        data: { batFirst: false },
      });
      await prisma.matchTeam.updateMany({
        where: { matchId, teamId: batFirst },
        data: { batFirst: true },
      });
    }

    await prisma.match.update({
      where: { id: matchId },
      data: {
        name: newName || name,
        overs,
        curPlayers: curPlayers as CurPlayer[],
        strikeIndex,
        hasEnded,
        allowSinglePlayer,
        curTeam,
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getValidatedUser();
    const { id } = await params;
    const match = await prisma.match.findFirst({ where: { userId, id } });
    if (!match)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.matchTeam.deleteMany({ where: { matchId: id } });
    await prisma.ballEvent.deleteMany({ where: { matchId: id } });
    await prisma.match.delete({ where: { userId, id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
