import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";
import { getValidatedUser } from "@/lib/utils";
import {
  createBallEventSchema,
  CreateBallEventSchema,
} from "@/lib/validation/ball-event";

export async function POST(req: NextRequest) {
  try {
    const userId = await getValidatedUser();
    const body: CreateBallEventSchema[] = await req.json();
    const parsed = createBallEventSchema.array().safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const ballEvents = parsed.data;
    const { matchId } = ballEvents[0] || {};
    if (!matchId)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    if (ballEvents.length) {
      await prisma.ballEvent.deleteMany({ where: { matchId } });
      await prisma.ballEvent.createMany({
        data: ballEvents.map(({ batsmanId, bowlerId, type }) => ({
          userId,
          matchId,
          batsmanId,
          bowlerId,
          type,
        })),
      });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
