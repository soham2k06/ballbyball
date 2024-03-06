import prisma from "@/lib/db/prisma";
import {
  createPlayerSchema,
  deletePlayerSchema,
  updatePlayerSchema,
} from "@/lib/validation/player";
import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = auth();
    const players = await prisma.player.findMany({});

    console.log(players);

    return NextResponse.json(players, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsedRes = createPlayerSchema.safeParse(body);

    if (!parsedRes.success) {
      console.error(parsedRes.error);
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { name, image, desc } = parsedRes.data;
    const { userId } = auth();
    if (!userId)
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    const player = await prisma.player.create({
      data: {
        userId,
        desc,
        name,
        image,
      },
    });
    return Response.json({ player }, { status: 201 });
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

    const player = await prisma.player.findUnique({ where: { id } });

    if (!player)
      return Response.json({ error: "Player not found" }, { status: 404 });

    const { userId } = auth();
    if (!userId || userId !== player.userId)
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

    const player = await prisma.player.findUnique({ where: { id } });

    if (!player)
      return Response.json({ error: "Player not found" }, { status: 404 });

    const { userId } = auth();
    if (!userId || userId !== player.userId)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.player.delete({ where: { id } });

    return Response.json({ message: "Player deleted" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
