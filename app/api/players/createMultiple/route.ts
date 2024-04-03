import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/db/prisma";
import { validateUser } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const userId = validateUser();

    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid input format, expected an array" },
        { status: 400 },
      );
    }

    const playersData = body.map((playerData) => ({
      userId,
      name: playerData,
    }));

    const createdPlayers = await prisma.player.createMany({
      data: playersData,
    });

    return NextResponse.json({ players: createdPlayers }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
