import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/db/prisma";

function checkAuth(req: NextRequest) {
  return req.cookies.get("sadmin_auth")?.value === "1";
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [totalUsers, totalMatches, totalPlayers, totalTeams, totalBallEvents] =
    await Promise.all([
      prisma.user.count(),
      prisma.match.count(),
      prisma.player.count(),
      prisma.team.count(),
      prisma.ballEvent.count(),
    ]);

  return NextResponse.json({
    totals: { users: totalUsers, matches: totalMatches, players: totalPlayers, teams: totalTeams, ballEvents: totalBallEvents },
  });
}
