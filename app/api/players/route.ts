import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";
import { createPlayerSchema } from "@/lib/validation/player";
import { createOrUpdateWithUniqueName, validateUser } from "@/lib/utils";

export async function GET() {
  try {
    const userId = validateUser();

    const players = await prisma.player.findMany({
      where: { userId },
      orderBy: { id: "asc" },
      select: { id: true, name: true },
    });

    if (!players)
      return NextResponse.json({ error: "No data found" }, { status: 404 });

    return NextResponse.json(players, { status: 200 });
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
    const parsedRes = createPlayerSchema.safeParse(body);

    if (!parsedRes.success) {
      console.error(parsedRes.error);
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { name, uid } = parsedRes.data;

    const newName = await createOrUpdateWithUniqueName(name, prisma.player);

    const userId = validateUser();

    await prisma.player.create({
      data: {
        userId,
        name: newName,
        uid,
      },
      select: { id: true, name: true },
    });

    return NextResponse.json({ message: "success" }, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
