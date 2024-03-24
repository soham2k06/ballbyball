import { NextResponse, NextRequest } from "next/server";
import { auth } from "@clerk/nextjs";
import { toast } from "sonner";
import prisma from "@/lib/db/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid input format, expected an array" },
        { status: 400 },
      );
    }

    const { userId } = auth();

    if (!userId) {
      toast.error("User Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
