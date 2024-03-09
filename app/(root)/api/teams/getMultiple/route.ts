import prisma from "@/lib/db/prisma";
import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { toast } from "sonner";

export async function POST(req: NextRequest) {
  const { ids: idsArrays } = await req.json();

  try {
    const { userId } = auth();

    if (!userId) {
      toast.error("User Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!Array.isArray(idsArrays) || idsArrays.length === 0) {
      return NextResponse.json(
        { error: "Invalid IDs provided" },
        { status: 400 },
      );
    }

    const teamsByIds = await Promise.all(
      idsArrays.map(async (ids) => {
        if (!Array.isArray(ids) || ids.length === 0) {
          return [];
        }

        const teams = await Promise.all(
          ids.map(async (id) => {
            const team = await prisma.team.findUnique({
              where: { id },
              select: { id: true, name: true },
            });
            if (!team) {
              throw new Error(`Team with ID ${id} not found`);
            }
            return team;
          }),
        );

        return teams;
      }),
    );

    return NextResponse.json(teamsByIds, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 404 },
    );
  }
}
