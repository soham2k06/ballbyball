import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";
import { createOrUpdateWithUniqueName, getValidatedUser } from "@/lib/utils";
import { createTeamSchema } from "@/lib/validation/team";
import { TeamWithPlayers } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const userRef = req.nextUrl.searchParams.get("user");
    const userId = userRef ?? (await getValidatedUser());
    const pageParam = req.nextUrl.searchParams.get("page");
    const pageSizeParam = req.nextUrl.searchParams.get("pageSize");
    const sort = req.nextUrl.searchParams.get("sort") ?? "desc";
    const search = req.nextUrl.searchParams.get("search") ?? "";

    const where = {
      userId,
      ...(search ? { name: { contains: search, mode: "insensitive" as const } } : {}),
    };

    const paginated = !!pageSizeParam;
    const page = parseInt(pageParam ?? "1");
    const pageSize = parseInt(pageSizeParam ?? "0");

    const [rawTeams, count] = await Promise.all([
      prisma.team.findMany({
        where,
        select: {
          id: true,
          name: true,
          captain: true,
          teamPlayers: {
            select: { player: { select: { id: true, name: true } } },
          },
        },
        orderBy: { createdAt: sort === "asc" ? "asc" : "desc" },
        ...(paginated ? { skip: (page - 1) * pageSize, take: pageSize } : {}),
      }),
      prisma.team.count({ where }),
    ]);

    const teams = rawTeams.map(({ teamPlayers, ...rest }) => ({
      ...rest,
      players: teamPlayers.map((tp) => tp.player),
    }));

    return NextResponse.json({ teams: teams as TeamWithPlayers[], count });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getValidatedUser();
    const body = await req.json();
    const parsed = createTeamSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    const { name, playerIds, captain } = parsed.data;
    const newName = await createOrUpdateWithUniqueName(name, prisma.team);
    await prisma.team.create({
      data: {
        matchId: null,
        userId,
        name: newName,
        teamPlayers: {
          create: playerIds
            .reverse()
            .map((playerId) => ({ player: { connect: { id: playerId } } })),
        },
        ...(captain && { captain }),
      },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
