"use server";

import { revalidatePath } from "next/cache";

import { Player } from "@prisma/client";

import prisma from "../db/prisma";
import {
  createOrUpdateWithUniqueName,
  handleError,
  getValidatedUser,
  getPlayersFromMatches,
  getMVP,
  calcBestPerformance,
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
      select: { id: true, name: true, order: true },
    });

    const sortedPlayers = players.sort((a, b) => {
      if (a.order === null) return 1; // Move `null` values to the end
      if (b.order === null) return -1;
      return a.order - b.order; // Sort by ascending order
    });

    return sortedPlayers;
  } catch (error) {
    handleError(error);
  }
}

export async function getPlayerBySortedPerformance() {
  const userId = await getValidatedUser();
  try {
    const matches = await prisma.match.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        createdAt: true,
        ballEvents: {
          select: {
            matchId: true,
            id: true,
            batsman: { select: { id: true, name: true } },
            bowler: { select: { id: true, name: true } },
            type: true,
          },
        },
      },
    });

    const players = await getPlayersFromMatches(matches);

    const mvpPerformance = getMVP(players);

    const bestPlayers = calcBestPerformance({
      playersPerformance: mvpPerformance,
    });

    return bestPlayers.map((player) => {
      const curRecord = mvpPerformance.find(
        (record) => record.playerId === player.playerId,
      );

      const name = curRecord?.name ?? "";

      return {
        id: player.playerId,
        name,
        points: player.points,
      };
    });
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
  const userId = await getValidatedUser();
  try {
    const playerToDelete = await prisma.player.findUnique({
      where: { id, userId },
    });

    if (!playerToDelete) throw new Error("Player not found!");

    await prisma.teamPlayer.deleteMany({ where: { playerId: id } });
    await prisma.ballEvent.deleteMany({
      where: {
        OR: [{ batsmanId: id }, { bowlerId: id }],
      },
    });
    await prisma.player.delete({ where: { id } });

    revalidatePath("/players");
  } catch (error) {
    handleError(error);
  }
}

export async function sortPlayers({ players }: { players: Player[] }) {
  const userId = await getValidatedUser();

  try {
    const updates = players.map((item) => ({
      id: item.id,
      order: item.order,
    }));

    await prisma.$transaction(
      updates.map((update) =>
        prisma.player.update({
          where: { id: update.id, userId },
          data: { order: update.order },
        }),
      ),
    );
    // const fromTargetPlayers = await prisma.player.findMany({
    //   where: { userId, id: { in: [from, target] } },
    // });

    // const fromItem = fromTargetPlayers.find((item) => item.id === from);
    // const targetItem = fromTargetPlayers.find((item) => item.id === target);

    // if (!fromItem || !targetItem) {
    //   throw new Error("One or both items not found");
    // }

    // await prisma.$transaction([
    //   prisma.player.update({
    //     where: { id: from },
    //     data: { order: targetItem.order },
    //   }),
    //   prisma.player.update({
    //     where: { id: target },
    //     data: { order: fromItem.order },
    //   }),
    // ]);

    // revalidatePath("/players");
  } catch (error) {
    handleError(error);
  }
}
