import prisma from "@/lib/db/prisma";
import { createBallEventSchema } from "@/lib/validation/ballEvent";

import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) throw new Error("User not authenticated");

    const ballEvents = await prisma.ballEvent.findMany({ where: { userId } });

    return NextResponse.json(ballEvents, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) throw new Error("User not authenticated");

    const body = await req.json();
    const parsedRes = createBallEventSchema.safeParse(body);

    if (!parsedRes.success) {
      console.error("Error Parsing JSON ----->", parsedRes.error);
      return NextResponse.json({ error: "Invalid inputs" }, { status: 422 });
    }

    const { batsmanId, bowlerId, type, matchId } = parsedRes.data;

    const newBallEvent = await prisma.ballEvent.create({
      data: {
        userId,
        matchId,
        batsmanId,
        bowlerId,
        type,
      },
    });

    return NextResponse.json(newBallEvent, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
