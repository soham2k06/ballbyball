import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";
import { getValidatedUser } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const userId = await getValidatedUser();
    const { names }: { names: string[] } = await req.json();
    if (!Array.isArray(names) || !names.length)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    await prisma.player.createMany({
      data: names.map((name) => ({ userId, name })),
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
