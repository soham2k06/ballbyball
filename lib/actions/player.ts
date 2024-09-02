"use server";

import { revalidatePath } from "next/cache";
import prisma from "../db/prisma";
import {
  createOrUpdateWithUniqueName,
  handleError,
  getValidatedUser,
} from "../utils";
import {
  createPlayerSchema,
  CreatePlayerSchema,
  updatePlayerSchema,
  UpdatePlayerSchema,
} from "../validation/player";

export async function getAllPlayers(user?: string | null) {
  const userId = user ?? (await getValidatedUser());
  try {
    const players = await prisma.player.findMany({
      where: { userId },
      orderBy: { id: "asc" },
      select: { id: true, name: true },
    });
    return players;
  } catch (error) {
    handleError(error);
  }
}

export async function createPlayer(data: CreatePlayerSchema) {
  const userId = await getValidatedUser();
  const parsedRes = createPlayerSchema.safeParse(data);

  if (!parsedRes.success) {
    console.error(parsedRes.error);
    throw new Error("Invalid input");
  }

  const { name } = parsedRes.data;

  try {
    const newName = await createOrUpdateWithUniqueName(name, prisma.player);

    await prisma.player.create({
      data: {
        userId,
        name: newName,
      },
    });

    revalidatePath("/players");
  } catch (error) {
    handleError(error);
  }
}

export async function createMultiplePlayers(
  data: CreatePlayerSchema["name"][],
) {
  const userId = await getValidatedUser();

  if (!Array.isArray(data)) throw new Error("Invalid input");

  const playersData = data.map((playerData) => ({
    userId,
    name: playerData,
  }));

  try {
    await prisma.player.createMany({ data: playersData });
    revalidatePath("/players");
  } catch (error) {
    handleError(error);
  }
}

export async function updatePlayer(data: UpdatePlayerSchema) {
  const parsedRes = updatePlayerSchema.safeParse(data);

  if (!parsedRes.success) {
    console.error(parsedRes.error);
    throw new Error("Invalid input");
  }

  const { name, id } = parsedRes.data;

  try {
    const player = await prisma.player.findFirst({ where: { id } });
    if (!player) throw new Error("Player not found");

    const newName = await createOrUpdateWithUniqueName(name, prisma.player, id);
    await prisma.player.update({ where: { id }, data: { name: newName } });

    revalidatePath("/players");
  } catch (error) {
    handleError(error);
  }
}

export async function deletePlayer(id: string) {
  try {
    const playerToDelete = await prisma.player.findUnique({ where: { id } });

    if (!playerToDelete) throw new Error("Player not found!");
    await prisma.teamPlayer.deleteMany({ where: { playerId: id } });
    await prisma.player.delete({ where: { id } });
    revalidatePath("/players");
  } catch (error) {
    handleError(error);
  }
}
