import prisma from "@/lib/db/prisma";
import { PlayerPerformance } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    playersPerformance,
    team1,
    team2,
  }: {
    playersPerformance: PlayerPerformance[];
    team1: string;
    team2: string;
  } = await req.json();
  try {
    const topBatsmenT1 = playersPerformance
      .filter((player) => player.team === team1 && player.ballsFaced)
      .sort((a, b) => b.runsScored - a.runsScored)
      .slice(0, 2)
      .map((player) => ({ ...player, type: "batsman" }));

    const topBatsmenT2 = playersPerformance
      .filter((player) => player.team === team2 && player.ballsFaced)
      .sort((a, b) => b.runsScored - a.runsScored)
      .slice(0, 2)
      .map((player) => ({ ...player, type: "batsman" }));

    const topBowlersT1 = playersPerformance
      .filter((player) => player.team === team1 && player.ballsBowled)
      .sort((a, b) => b.wicketsTaken - a.wicketsTaken)
      .slice(0, 2)
      .map((player) => ({ ...player, type: "bowler" }));

    const topBowlersT2 = playersPerformance
      .filter((player) => player.team === team2 && player.ballsBowled)
      .sort((a, b) => b.wicketsTaken - a.wicketsTaken)
      .slice(0, 2)
      .map((player) => ({ ...player, type: "bowler" }));

    const players = [
      ...topBatsmenT1,
      ...topBatsmenT2,
      ...topBowlersT1,
      ...topBowlersT2,
    ];

    const playerNames = await prisma.player.findMany({
      where: {
        id: {
          in: players.map((player) => player.playerId),
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const topPerformers = players.map((player) => {
      const { name } = playerNames.find((p) => p.id === player.playerId) ?? {
        name: "Unknown",
      };

      return { ...player, name };
    });

    return NextResponse.json(topPerformers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      status: 500,
      body: { message: "Internal Server Error" },
    });
  }
}
