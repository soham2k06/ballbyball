import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";
import { getValidatedUser } from "@/lib/utils";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> },
) {
  try {
    const userId = await getValidatedUser();
    const { matchId } = await params;
    const match = await prisma.match.findFirst({ where: { userId, id: matchId } });
    if (!match)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.ballEvent.deleteMany({ where: { matchId } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
