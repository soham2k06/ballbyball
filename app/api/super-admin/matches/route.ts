import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";

function checkAuth(req: NextRequest) {
  return req.cookies.get("sadmin_auth")?.value === "1";
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(req.nextUrl.searchParams.get("limit") ?? "10"));
  const skip = (page - 1) * limit;

  const [matches, total] = await Promise.all([
    prisma.match.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: { id: true, name: true, createdAt: true, userId: true, hasEnded: true },
    }),
    prisma.match.count(),
  ]);

  const userIds = Array.from(new Set(matches.map((m) => m.userId)));
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  });
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  const enriched = matches.map((m) => ({ ...m, user: userMap[m.userId] ?? null }));

  return NextResponse.json({ matches: enriched, total, page, limit });
}
