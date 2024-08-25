"use server";

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
import { revalidatePath } from "next/cache";
import { updateMatchSchema } from "../validation/match";
import { CurPlayer } from "@prisma/client";

export async function getAllMatches() {
  const userId = await getValidatedUser();
  const matches = await prisma.match.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
      hasEnded: true,
      overs: true,
      createdAt: true,
      ballEvents: {
        select: { batsmanId: true, type: true },
        orderBy: { id: "asc" },
      },
      matchTeams: {
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
      const { teamPlayers, ...teamWithoutPlayers } = matchTeam.team;
      return {
        playerIds: matchTeam.team.teamPlayers.map(({ playerId }) => playerId),
        ...teamWithoutPlayers,
      };
    });

    const { matchTeams, ...matchWithoutMatchTeams } = match;

    return { ...matchWithoutMatchTeams, teams };
  }) as MatchExtended[];

  return matchesSimplified;
}

export async function getMatchById(id: string) {
  const userId = await getValidatedUser();

  const fetchedMatch = await prisma.match.findFirst({
    where: { userId, id },
    include: {
      ballEvents: {
        select: { batsmanId: true, bowlerId: true, type: true },
        orderBy: { id: "asc" },
      },
      matchTeams: {
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

  const { name, teamIds, curTeam, overs, curPlayers, allowSinglePlayer } =
    parsedRes.data;

  try {
    const newName = await createOrUpdateWithUniqueName(name, prisma.team);

    const match = await prisma.match.create({
      data: {
        userId,
        name: newName,
        matchTeams: {
          create: teamIds.reverse().map((teamId) => ({
            team: { connect: { id: teamId } },
          })),
        },
        curPlayers,
        curTeam: curTeam ?? 0,
        overs,
        allowSinglePlayer,
      },
    });

    await prisma.team.updateMany({
      where: { id: { in: teamIds } },
      data: { matchId: match.id },
    });
  } catch (error) {
    handleError(error);
  }

  revalidatePath("/match");
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
    curTeam,
    name,
    overs,
    strikeIndex,
    hasEnded,
    allowSinglePlayer,
  } = parsedRes.data;

  try {
    const newName = await createOrUpdateWithUniqueName(
      name ?? "",
      prisma.match,
      matchId,
    );

    await prisma.match.update({
      where: { id: matchId },
      data: {
        name: newName || name,
        overs,
        curPlayers: curPlayers as CurPlayer[],
        curTeam,
        strikeIndex,
        hasEnded,
        allowSinglePlayer,
      },
      select: { id: true },
    });
    revalidatePath("/match");
  } catch (error) {
    handleError(error);
  }
}

export async function deleteMatch(id: string) {
  try {
    await prisma.matchTeam.deleteMany({ where: { matchId: id } });
    await prisma.ballEvent.deleteMany({ where: { matchId: id } });
    await prisma.match.delete({ where: { id } });
    revalidatePath("/match");
  } catch (error) {
    handleError(error);
  }
}
