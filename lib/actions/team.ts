"use server";

import { TeamWithPlayers } from "@/types";
import prisma from "../db/prisma";
import {
  createOrUpdateWithUniqueName,
  handleError,
  getValidatedUser,
} from "../utils";
import {
  createTeamSchema,
  CreateTeamSchema,
  updateTeamSchema,
  UpdateTeamSchema,
} from "../validation/team";
import { revalidatePath } from "next/cache";

export async function getAllTeams(user?: string | null) {
  const userId = user ?? (await getValidatedUser());

  try {
    const teams = await prisma.team.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        captain: true,
        teamPlayers: {
          select: { player: { select: { id: true, name: true } } },
        },
      },
    });

    const teamsSimplified = teams.map((team) => {
      const players = team.teamPlayers.map((teamPlayer) => teamPlayer.player);

      const { teamPlayers, ...playerWithoutTeamPlayers } = team;

      return { ...playerWithoutTeamPlayers, players };
    });

    return teamsSimplified as TeamWithPlayers[];
  } catch (error) {
    handleError(error);
  }
}

export async function createTeam(data: CreateTeamSchema) {
  const userId = await getValidatedUser();

  const parsedRes = createTeamSchema.safeParse(data);

  if (!parsedRes.success) {
    console.error(parsedRes.error);
    throw new Error("Invalid input");
  }

  const { name, playerIds, captain } = parsedRes.data;

  try {
    const newName = await createOrUpdateWithUniqueName(name, prisma.team);

    await prisma.team.create({
      data: {
        userId,
        name: newName,
        teamPlayers: {
          create: playerIds.reverse().map((playerId: string) => ({
            player: { connect: { id: playerId } },
          })),
        },
        ...(captain && { captain }),
      },
    });

    revalidatePath("/teams");
  } catch (error) {
    handleError(error);
  }
}

export async function createMultipleTeams(data: CreateTeamSchema[]) {
  const userId = await getValidatedUser();

  if (!data.length) throw new Error("Invalid input");

  try {
    await Promise.all(
      data.reverse().map(async ({ name, playerIds, captain }) => {
        const newName = await createOrUpdateWithUniqueName(name, prisma.team);

        return prisma.team.create({
          data: {
            userId,
            name: newName,
            teamPlayers: {
              create: playerIds.reverse().map((playerId: string) => ({
                player: { connect: { id: playerId } },
              })),
            },
            ...(captain && { captain }),
          },
        });
      }),
    );

    revalidatePath("/teams");
  } catch (error) {
    handleError(error);
  }
}

export async function updateTeam(data: UpdateTeamSchema) {
  const userId = await getValidatedUser();

  const parsedRes = updateTeamSchema.safeParse(data);

  if (!parsedRes.success) throw new Error("Invalid Input");

  const { name, playerIds, captain, id } = parsedRes.data;

  try {
    const team = await prisma.team.findFirst({
      where: { id },
      include: { teamPlayers: true },
    });

    if (!team) throw new Error("Team not found!");

    if (team.userId !== userId) throw new Error("Team is not created by you");

    const newName = await createOrUpdateWithUniqueName(name, prisma.team, id);

    await prisma.team.update({
      where: { id },
      data: {
        name: newName,
        teamPlayers: {
          deleteMany: {},
          create: playerIds.map((playerId: string) => ({
            player: { connect: { id: playerId } },
          })),
        },
        captain,
      },
      include: { teamPlayers: { include: { player: true } } },
    });

    revalidatePath("/teams");
  } catch (error) {
    handleError(error);
  }
}

export async function deleteTeam(id: string) {
  try {
    await prisma.teamPlayer.deleteMany({ where: { teamId: id } });
    await prisma.team.delete({ where: { id } });

    revalidatePath("/teams");
  } catch (error) {
    handleError(error);
  }
}
