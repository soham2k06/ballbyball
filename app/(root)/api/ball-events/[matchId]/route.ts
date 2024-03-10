import prisma from "@/lib/db/prisma";

import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
  _: any,
  { params: { matchId } }: { params: { matchId: string } },
) {
  try {
    const { userId } = auth();
    if (!userId) throw new Error("User not authenticated");

    const ballEvents = await prisma.ballEvent.findMany({ where: { matchId } });

    return NextResponse.json(ballEvents, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
