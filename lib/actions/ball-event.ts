"use server";

import {
  createBallEventSchema,
  CreateBallEventSchema,
} from "../validation/ballEvent";
import prisma from "../db/prisma";
import { validateUser } from "../utils";
import { revalidatePath } from "next/cache";

export async function saveBallEvents(data: CreateBallEventSchema[]) {
  const userId = validateUser();
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
  await prisma.ballEvent.deleteMany({
    where: { matchId },
  });

  revalidatePath("/match");
}
