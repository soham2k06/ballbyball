import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";

function checkAuth(req: NextRequest) {
  return req.cookies.get("sadmin_auth")?.value === "1";
}

type SortField = "name" | "email" | "createdAt" | "lastActive" | "matchCount";
type SortOrder = "asc" | "desc";

const DB_SORT_FIELDS = new Set<SortField>(["name", "email", "createdAt"]);

const userSelect = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  sessions: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
    select: { createdAt: true },
  },
};

type RawUser = {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: Date;
  sessions: { createdAt: Date }[];
};

async function enrich(users: RawUser[]) {
  const ids = users.map((u) => u.id);
  const matchCounts = await prisma.match.groupBy({
    by: ["userId"],
    where: { userId: { in: ids } },
    _count: { id: true },
  });
  const countMap = Object.fromEntries(matchCounts.map((m) => [m.userId, m._count.id]));
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    createdAt: u.createdAt,
    lastActive: u.sessions[0]?.createdAt ?? null,
    matchCount: countMap[u.id] ?? 0,
  }));
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const page = Math.max(1, parseInt(req.nextUrl.searchParams.get("page") ?? "1"));
  const limit = Math.min(50, parseInt(req.nextUrl.searchParams.get("limit") ?? "10"));
  const search = req.nextUrl.searchParams.get("search") ?? "";
  const sort = (req.nextUrl.searchParams.get("sort") ?? "createdAt") as SortField;
  const order = (req.nextUrl.searchParams.get("order") ?? "desc") as SortOrder;

  const where = search
    ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { email: { contains: search, mode: "insensitive" as const } }] }
    : {};

  if (DB_SORT_FIELDS.has(sort)) {
    const skip = (page - 1) * limit;
    const [rawUsers, total] = await Promise.all([
      prisma.user.findMany({ where, orderBy: { [sort]: order }, skip, take: limit, select: userSelect }),
      prisma.user.count({ where }),
    ]);
    const users = await enrich(rawUsers);
    return NextResponse.json({ users, total, page, limit });
  }

  // lastActive / matchCount: fetch all, sort in memory, paginate
  const rawUsers = await prisma.user.findMany({ where, select: userSelect });
  const enriched = await enrich(rawUsers);

  enriched.sort((a, b) => {
    if (sort === "matchCount")
      return order === "desc" ? b.matchCount - a.matchCount : a.matchCount - b.matchCount;
    const at = a.lastActive ? new Date(a.lastActive).getTime() : 0;
    const bt = b.lastActive ? new Date(b.lastActive).getTime() : 0;
    return order === "desc" ? bt - at : at - bt;
  });

  const total = enriched.length;
  const skip = (page - 1) * limit;
  return NextResponse.json({ users: enriched.slice(skip, skip + limit), total, page, limit });
}
