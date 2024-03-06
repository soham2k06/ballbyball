import prisma from "@/lib/db/prisma";
import { createMatchSchema } from "@/lib/validation/match";
import {
  deletePlayerSchema,
  updatePlayerSchema,
} from "@/lib/validation/player";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

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

    return NextResponse.json({ match });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const parsedRes = updatePlayerSchema.safeParse(body);

    if (!parsedRes.success) {
      console.error(parsedRes.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { id, name, isCaptain, desc, image } = parsedRes.data;

    const note = await prisma.player.findUnique({ where: { id } });

    if (!note)
      return Response.json({ error: "Note not found" }, { status: 404 });

    const { userId } = auth();
    if (!userId || userId !== note.userId)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    await prisma.player.update({
      where: { id },
      data: {
        name,
        userId,
        isCaptain,
        desc,
        image,
      },
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const parsedRes = deletePlayerSchema.safeParse(body);

    if (!parsedRes.success) {
      console.error(parsedRes.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { id } = parsedRes.data;

    const note = await prisma.player.findUnique({ where: { id } });

    if (!note)
      return Response.json({ error: "Item not found" }, { status: 404 });

    const { userId } = auth();
    if (!userId || userId !== note.userId)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.player.delete({ where: { id } });

    return Response.json({ message: "Item deleted" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
