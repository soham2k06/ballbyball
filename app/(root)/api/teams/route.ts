import prisma from "@/lib/db/prisma";
import { createTeamSchema, updateTeamSchema } from "@/lib/validation/team";

import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) throw new Error("User not authenticated");

    const players = await prisma.team.findMany({ where: { userId } });

    return NextResponse.json(players, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedRes = createTeamSchema.safeParse(body);

    if (!parsedRes.success) {
      console.error(parsedRes.error);
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { name, playerIds, captain } = parsedRes.data;
    const { userId } = auth();
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const team = await prisma.team.create({
      data: {
        userId,
        name,
        playerIds,
        captain,
      },
    });
    return NextResponse.json({ team });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
