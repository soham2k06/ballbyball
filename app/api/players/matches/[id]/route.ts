import prisma from "@/lib/db/prisma";
import { calculateWinner, getScore } from "@/lib/utils";
import { NextResponse } from "next/server";

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
        matchTeams: {
          select: {
            team: {
              select: {
                name: true,
                teamPlayers: { select: { playerId: true } },
              },
            },
          },
        },
        ballEvents: { select: { batsmanId: true, type: true } },
      },
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

      const { runs: runs1 } = getScore(ballEventsbyTeam(0));
      const {
        runs: runs2,
        wickets: wickets2,
        totalBalls,
      } = getScore(ballEventsbyTeam(1));

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
        hasPlayerWon,
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