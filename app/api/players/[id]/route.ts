import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { createPlayerSchema } from "@/lib/validation/player";
import { createWithUniqueName, validateUser } from "@/lib/utils";

export async function GET(
  _: unknown,
  { params: { id } }: { params: { id: string } },
) {
  try {
    validateUser();

    const player = await prisma.player.findFirst({
      where: { id },
      select: { id: true, name: true },
    });

    if (!player)
      return NextResponse.json({ error: "Player not found" }, { status: 404 });

    return NextResponse.json(player, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params: { id } }: { params: { id: string } },
) {
  try {
    validateUser();

    const body = await req.json();
    const parsedRes = createPlayerSchema.safeParse(body);

    if (!parsedRes.success) {
      console.error(parsedRes.error);
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { name } = parsedRes.data;

    const player = await prisma.player.findFirst({ where: { id } });

    if (!player)
      return NextResponse.json({ error: "Player not found" }, { status: 404 });

    const newName = await createWithUniqueName(name, prisma.player);

    await prisma.player.update({ where: { id }, data: { name: newName } });

    return NextResponse.json({ message: "Player updated" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _: unknown,
  { params: { id } }: { params: { id: string } },
) {
  try {
    validateUser();

    if (!id)
      return NextResponse.json(
        { error: "Player id is not valid" },
        { status: 401 },
      );

    const playerToDelete = await prisma.player.findUnique({ where: { id } });

    if (!playerToDelete)
      return NextResponse.json({ error: "Player not found" }, { status: 404 });

    await prisma.teamPlayer.deleteMany({ where: { playerId: id } });
    await prisma.player.delete({ where: { id } });

    return NextResponse.json({ message: "Player deleted" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
