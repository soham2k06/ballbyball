import prisma from "@/lib/db/prisma";
import { createMatchSchema } from "@/lib/validation/match";

import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = auth();
    if (!userId) throw new Error("User not authenticated");

    const matches = await prisma.match.findMany({ where: { userId } });

    return NextResponse.json(matches, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsedRes = createMatchSchema.safeParse(body);

    if (!parsedRes.success) {
      console.error("Error Parsing JSON ----->", parsedRes.error);
      return NextResponse.json({ error: "Invalid inputs" });
    }

    const { name, teamIds } = parsedRes.data;

    const { userId } = auth();
    if (!userId)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const match = await prisma.match.create({
      data: {
        userId,
        name,
        teamIds: { set: teamIds! },
      },
    });

    return NextResponse.json({ match, status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
