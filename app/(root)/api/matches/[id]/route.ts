import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prisma from "@/lib/db/prisma";

export async function GET(
  _: unknown,
  { params: { id } }: { params: { id: string } },
) {
  try {
    const { userId } = auth();
    if (!userId) throw new Error("User not authenticated");

    const ballEvents = await prisma.match.findFirst({ where: { id } });

    return NextResponse.json(ballEvents, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
