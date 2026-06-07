import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";
import { createOrUpdateWithUniqueName, getValidatedUser } from "@/lib/utils";
import { updatePlayerSchema } from "@/lib/validation/player";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await getValidatedUser();
    const { id } = await params;
    const body = await req.json();
    const parsed = updatePlayerSchema.safeParse({ ...body, id });
    if (!parsed.success)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const player = await prisma.player.findFirst({ where: { id, userId } });
    if (!player)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const newName = await createOrUpdateWithUniqueName(
      parsed.data.name,
      prisma.player,
      id,
    );
    await prisma.player.update({ where: { id }, data: { name: newName } });
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
    const player = await prisma.player.findUnique({ where: { id, userId } });
    if (!player)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.teamPlayer.deleteMany({ where: { playerId: id } });
    await prisma.ballEvent.deleteMany({
      where: { OR: [{ batsmanId: id }, { bowlerId: id }] },
    });
    await prisma.player.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
