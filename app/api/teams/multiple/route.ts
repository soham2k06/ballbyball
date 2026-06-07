import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";
import { createOrUpdateWithUniqueName, getValidatedUser } from "@/lib/utils";
import { CreateTeamSchema } from "@/lib/validation/team";

export async function POST(req: NextRequest) {
  try {
    const userId = await getValidatedUser();
    const { teams }: { teams: CreateTeamSchema[] } = await req.json();
    if (!Array.isArray(teams) || !teams.length)
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });

    await Promise.all(
      teams.map(async ({ name, playerIds, captain }) => {
        const newName = await createOrUpdateWithUniqueName(name, prisma.team);
        return prisma.team.create({
          data: {
            userId,
            name: newName,
            teamPlayers: {
              create: [...playerIds].reverse().map((playerId) => ({
                player: { connect: { id: playerId } },
              })),
            },
            ...(captain && { captain }),
          },
        });
      }),
    );
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
