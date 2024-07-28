import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(
  _: unknown,
  { params: { id } }: { params: { id: string } },
) {
  try {
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
