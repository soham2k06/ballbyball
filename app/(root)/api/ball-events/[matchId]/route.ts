import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function DELETE(
  _: unknown,
  { params: { matchId } }: { params: { matchId: string } },
) {
  try {
    if (!matchId) {
      return NextResponse.json(
        { error: "Match ID not provided" },
        { status: 400 },
      );
    }

    await prisma.ballEvent.deleteMany({
      where: { matchId },
    });

    return NextResponse.json(
      { message: "Ball events deleted" },
      { status: 202 },
    );
  } catch (error) {
    console.error("Error deleting ball events:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
