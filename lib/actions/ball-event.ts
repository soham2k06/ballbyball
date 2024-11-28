"use server";

import { revalidatePath } from "next/cache";

import prisma from "../db/prisma";
import { getValidatedUser } from "../utils";
import {
  createBallEventSchema,
  CreateBallEventSchema,
} from "../validation/ball-event";

export async function saveBallEvents(data: CreateBallEventSchema[]) {
  const userId = await getValidatedUser();
  const parsedRes = createBallEventSchema.array().safeParse(data);

  if (!parsedRes.success) {
    console.error("Error Parsing JSON ----->", parsedRes.error);
    throw new Error("Invalid Input");
  }

  const ballEvents = parsedRes.data;

  const { matchId } = ballEvents[0] || {};

  if (ballEvents.length)
    await prisma.ballEvent.deleteMany({ where: { matchId } });

  await prisma.ballEvent.createMany({
    data: ballEvents.map(({ batsmanId, bowlerId, type }) => ({
      userId,
      matchId,
      batsmanId,
      bowlerId,
      type,
    })),
  });

  revalidatePath("/match");
}

export async function deleteAllBallEvents(matchId: string) {
  const userId = await getValidatedUser();
  try {
    const matchExists = await prisma.match.findFirst({
      where: { userId, id: matchId },
    });

    if (!matchExists) throw new Error("Match not found");

    await prisma.ballEvent.deleteMany({
      where: { matchId },
    });

    revalidatePath("/match");
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
