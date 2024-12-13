"use server";

import { revalidatePath } from "next/cache";

import { CurPlayer } from "@prisma/client";

import { MatchExtended } from "@/types";

import prisma from "../db/prisma";
import {
  createOrUpdateWithUniqueName,
  handleError,
  getValidatedUser,
} from "../utils";
import {
  createMatchSchema,
  CreateMatchSchema,
  UpdateMatchSchema,
} from "../validation/match";
import { updateMatchSchema } from "../validation/match";

export async function getAllMatches(user?: string | null, size: string = "5") {
  const userId = user ?? (await getValidatedUser());

  const matches = await prisma.match.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: parseInt(size),
    select: {
      id: true,
      name: true,
      hasEnded: true,
      overs: true,
      createdAt: true,
      curTeam: true,
      allowSinglePlayer: true,
      ballEvents: {
        select: { batsmanId: true, type: true },
        orderBy: { id: "asc" },
      },
      matchTeams: {
        orderBy: { batFirst: "desc" },
        include: {
          team: {
            select: {
              id: true,
              name: true,
              teamPlayers: { select: { playerId: true } },
            },
          },
        },
      },
    },
  });

  const matchesSimplified = matches.map((match) => {
    const teams = match.matchTeams.map((matchTeam) => {
      // eslint-disable-next-line no-unused-vars
      const { teamPlayers, ...teamWithoutPlayers } = matchTeam.team;
      return {
        playerIds: matchTeam.team.teamPlayers.map(({ playerId }) => playerId),
        batFirst: matchTeam.batFirst,
        ...teamWithoutPlayers,
      };
    });

    // eslint-disable-next-line no-unused-vars
    const { matchTeams, ...matchWithoutMatchTeams } = match;

    return { ...matchWithoutMatchTeams, teams };
  }) as MatchExtended[];

  return matchesSimplified;
}

export async function getMatchById(id: string, user?: string | null) {
  const userId = user ?? (await getValidatedUser());

  const fetchedMatch = await prisma.match.findFirst({
    where: { userId, id },
    include: {
      ballEvents: {
        select: { batsmanId: true, bowlerId: true, type: true },
        orderBy: { id: "asc" },
      },
      matchTeams: {
        orderBy: { batFirst: "desc" },
        select: {
          team: {
            select: {
              id: true,
              name: true,
              teamPlayers: {
                select: { player: { select: { id: true, name: true } } },
              },
            },
          },
        },
      },
    },
  });

  if (!fetchedMatch) return null;

  const { matchTeams, ...match } = fetchedMatch;

  const matchSimplified = {
    teams: matchTeams?.map((team) => {
      const { teamPlayers, ...rest } = team.team;
      return {
        ...rest,
        players: teamPlayers.map((teamPlayer) => teamPlayer.player),
      };
    }),
    ...match,
  };

  if (!matchSimplified) throw new Error("Match not found");

  return matchSimplified as unknown as MatchExtended | null;
}

export async function createMatch(data: CreateMatchSchema) {
  const userId = await getValidatedUser();
  const parsedRes = createMatchSchema.safeParse(data);

  if (!parsedRes.success) throw new Error("Invalid inputs");

  const { name, teamIds, batFirst, overs, curPlayers, allowSinglePlayer } =
    parsedRes.data;

  try {
    const newName = await createOrUpdateWithUniqueName(name, prisma.team);

    const match = await prisma.match.create({
      data: {
        userId,
        name: newName,
        curPlayers,
        curTeam: 0,
        matchTeams: {
          createMany: {
            data: teamIds.map((teamId) => ({
              teamId,
              batFirst: teamId === batFirst,
            })),
          },
        },
        overs,
        allowSinglePlayer,
      },
    });

    await prisma.team.updateMany({
      where: { id: { in: teamIds } },
      data: { matchId: match.id },
    });

    revalidatePath("/match");
    return match.id;
  } catch (error) {
    handleError(error);
  }
}

export async function updateMatch(data: UpdateMatchSchema) {
  const dataWithSortedCurPlayers = {
    ...data,
    curPlayers: data.curPlayers?.sort((a, b) =>
      (a?.type || "batsman").localeCompare(b?.type || "batsman"),
    ),
  };

  const parsedRes = updateMatchSchema.safeParse(dataWithSortedCurPlayers);

  if (!parsedRes.success) throw new Error("Invalid Data");

  const {
    id: matchId,
    curPlayers,
    name,
    overs,
    batFirst,
    strikeIndex,
    hasEnded,
    allowSinglePlayer,
    curTeam,
  } = parsedRes.data;

  try {
    const newName = await createOrUpdateWithUniqueName(
      name ?? "",
      prisma.match,
      matchId,
    );

    if (batFirst) {
      await prisma.matchTeam.updateMany({
        where: { matchId, batFirst: true },
        data: { batFirst: false },
      });

      await prisma.matchTeam.updateMany({
        where: { matchId, teamId: batFirst },
        data: { batFirst: true },
      });
    }

    await prisma.match.update({
      where: { id: matchId },
      data: {
        name: newName || name,
        overs,
        curPlayers: curPlayers as CurPlayer[],
        strikeIndex,
        hasEnded,
        allowSinglePlayer,
        curTeam,
      },
      select: { id: true },
    });
    revalidatePath("/match");
  } catch (error) {
    handleError(error);
  }
}

export async function deleteMatch(id: string) {
  const userId = await getValidatedUser();
  try {
    const matchExists = await prisma.match.findFirst({
      where: { userId, id },
    });

    if (!matchExists) throw new Error("Match not found");

    await prisma.matchTeam.deleteMany({ where: { matchId: id } });
    await prisma.ballEvent.deleteMany({ where: { matchId: id } });
    await prisma.match.delete({ where: { userId, id } });
    revalidatePath("/match");
  } catch (error) {
    handleError(error);
  }
}
