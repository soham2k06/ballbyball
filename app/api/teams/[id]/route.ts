import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";
import { createOrUpdateWithUniqueName, getValidatedUser } from "@/lib/utils";
import { updateTeamSchema } from "@/lib/validation/team";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getValidatedUser();
    const { id } = await params;
    const body = await req.json();
    const parsed = updateTeamSchema.safeParse({ ...body, id });
    if (!parsed.success)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const team = await prisma.team.findFirst({ where: { id } });
    if (!team || team.userId !== userId)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { name, playerIds, captain } = parsed.data;
    const newName = await createOrUpdateWithUniqueName(name, prisma.team, id);
    await prisma.team.update({
      where: { id },
      data: {
        name: newName,
        teamPlayers: {
          deleteMany: {},
          create: playerIds.map((playerId) => ({
            player: { connect: { id: playerId } },
          })),
        },
        captain,
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
    const team = await prisma.team.findFirst({ where: { userId, id } });
    if (!team)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.teamPlayer.deleteMany({ where: { teamId: id } });
    await prisma.team.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
