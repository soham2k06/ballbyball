import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";
import { createOrUpdateWithUniqueName, getValidatedUser } from "@/lib/utils";
import { createPlayerSchema } from "@/lib/validation/player";

export async function GET(req: NextRequest) {
  try {
    const userRef = req.nextUrl.searchParams.get("user");
    const userId = userRef ?? (await getValidatedUser());
    const pageParam = req.nextUrl.searchParams.get("page");
    const pageSizeParam = req.nextUrl.searchParams.get("pageSize");
    const search = req.nextUrl.searchParams.get("search") ?? "";

    const where = {
      userId,
      ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
    };

    const paginated = !!pageSizeParam;
    const page = parseInt(pageParam ?? "1");
    const pageSize = parseInt(pageSizeParam ?? "0");

    const [players, count] = await Promise.all([
      prisma.player.findMany({
        where,
        select: { id: true, name: true, order: true },
        orderBy: { order: "asc" as const },
        ...(paginated ? { skip: (page - 1) * pageSize, take: pageSize } : {}),
      }),
      prisma.player.count({ where }),
    ]);

    return NextResponse.json({ players, count });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getValidatedUser();
    const body = await req.json();
    const parsed = createPlayerSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const newName = await createOrUpdateWithUniqueName(
      parsed.data.name,
      prisma.player,
    );
    const player = await prisma.player.create({
      data: { userId, name: newName },
      select: { id: true, name: true },
    });
    return NextResponse.json(player, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
