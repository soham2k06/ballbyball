import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";
import { createOrUpdateWithUniqueName, getValidatedUser } from "@/lib/utils";
import { createPlayerSchema } from "@/lib/validation/player";

export async function GET(req: NextRequest) {
  try {
    const userRef = req.nextUrl.searchParams.get("user");
    const userId = userRef ?? (await getValidatedUser());
    const players = await prisma.player.findMany({
      where: { userId },
      select: { id: true, name: true, order: true },
    });
    const sorted = players.sort((a, b) => {
      if (a.order === null) return 1;
      if (b.order === null) return -1;
      return a.order - b.order;
    });
    return NextResponse.json(sorted);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getValidatedUser();
    const body = await req.json();
    const parsed = createPlayerSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const newName = await createOrUpdateWithUniqueName(
      parsed.data.name,
      prisma.player,
    );
    const player = await prisma.player.create({
      data: { userId, name: newName },
      select: { id: true, name: true },
    });
    return NextResponse.json(player, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
