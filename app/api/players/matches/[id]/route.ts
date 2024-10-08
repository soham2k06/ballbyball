import { NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";
import { calculateWinner, getScore } from "@/lib/utils";

export async function GET(
  _: unknown,
  { params: { id } }: { params: { id: string } },
) {
  try {
    const playerMatches = await prisma.match.findMany({
      where: {
        matchTeams: {
          some: { team: { teamPlayers: { some: { playerId: id } } } },
        },
      },
      select: {
        id: true,
        name: true,
        overs: true,
        hasEnded: true,
        allowSinglePlayer: true,
        createdAt: true,
        matchTeams: {
          orderBy: { batFirst: "desc" },
          select: {
            team: {
              select: {
                name: true,
                teamPlayers: { select: { playerId: true } },
              },
            },
          },
        },
        ballEvents: { select: { batsmanId: true, bowlerId: true, type: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const matches = playerMatches.map((match) => {
      const teams = match.matchTeams.map(({ team }) => ({
        name: team.name,
        playerIds: team.teamPlayers.map(({ playerId }) => playerId),
      }));

      const ballEvents = match.ballEvents;

      const ballEventsbyTeam = (i: number) =>
        ballEvents
          .filter((event) => teams[i].playerIds.includes(event.batsmanId))
          .map((event) => event.type);

      const { runs: runs1 } = getScore({ balls: ballEventsbyTeam(0) });
      const {
        runs: runs2,
        wickets: wickets2,
        totalBalls,
      } = getScore({ balls: ballEventsbyTeam(1) });

      const playerBatEvents = ballEvents
        .filter((event) => event.batsmanId === id)
        .map((event) => event.type);

      const playerBowlEvents = ballEvents
        .filter((event) => event.bowlerId === id)
        .map((event) => event.type);

      const batScore = getScore({ balls: playerBatEvents, forBatsman: true });
      const bowlScore = getScore({ balls: playerBowlEvents, forBowler: true });

      const { winInfo, winner } = calculateWinner({
        allowSinglePlayer: match.allowSinglePlayer,
        matchBalls: match.overs * 6,
        runs1,
        runs2,
        teams: teams.map(({ name }) => name ?? ""),
        totalBalls,
        totalWickets: teams[1].playerIds.length,
        wickets2,
      });

      const hasPlayerWon = !match.hasEnded
        ? undefined
        : teams[winner]?.playerIds.includes(id)
          ? true
          : false;

      return {
        id: match.id,
        name: match.name,
        winInfo: match.hasEnded ? winInfo : "Not ended yet",
        batScore: {
          ...batScore,
          isNotout: batScore.wickets === 0,
        },
        bowlScore,

        hasPlayerWon,
        createdAt: match.createdAt,
      };
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
