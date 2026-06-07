import { NextRequest, NextResponse } from "next/server";

import { Player } from "@prisma/client";

import prisma from "@/lib/db/prisma";
import { getValidatedUser } from "@/lib/utils";

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getValidatedUser();
    const { players }: { players: Player[] } = await req.json();
    if (!Array.isArray(players))
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    for (let index = 0; index < players.length; index++) {
      await prisma.player.update({
        where: { id: players[index].id, userId },
        data: { order: index },
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
