import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";
import { createBallEventSchema } from "@/lib/validation/ballEvent";
import { validateUser } from "@/lib/utils";

export async function GET() {
  try {
    const userId = validateUser();

    const ballEvents = await prisma.ballEvent.findMany({ where: { userId } });

    if (!ballEvents)
      return NextResponse.json({ error: "No data found" }, { status: 404 });

    return NextResponse.json(ballEvents, { status: 200 });
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
    const userId = validateUser();

    const body = await req.json();
    const parsedRes = createBallEventSchema.array().safeParse(body);

    if (!parsedRes.success) {
      console.error("Error Parsing JSON ----->", parsedRes.error);
      return NextResponse.json({ error: "Invalid inputs" }, { status: 422 });
    }

    const ballEvents = parsedRes.data;

    const { matchId } = ballEvents[0] || {};

    if (ballEvents.length) {
      await prisma.ballEvent.deleteMany({ where: { matchId } });
    }

    const newBallEvents = await prisma.ballEvent.createMany({
      data: ballEvents.map(({ batsmanId, bowlerId, type }) => ({
        userId,
        matchId,
        batsmanId,
        bowlerId,
        type,
      })),
    });

    return NextResponse.json(newBallEvents, { status: 201 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
