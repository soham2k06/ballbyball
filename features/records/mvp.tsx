import { BallEvent, Player } from "@prisma/client";
import { endOfDay, startOfDay } from "date-fns";

import prisma from "@/lib/db/prisma";
import {
  calcBestPerformance,
  calcMilestones,
  calculateMaidenOvers,
  getScore,
  mapGroupedMatches,
  round,
} from "@/lib/utils";
import { EventType } from "@/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TabsContent } from "@/components/ui/tabs";

export const runtime = "edge";

async function MVP({
  players,
  userId,
  date,
}: {
  players: (Player & {
    playerBatEvents: BallEvent[];
    playerBallEvents: BallEvent[];
  })[];
  userId: string;
  date: string | null;
}) {
  const ballEventsFilter = date
    ? {
        Match: {
          createdAt: {
            gte: startOfDay(new Date(date)),
            lte: endOfDay(new Date(date)),
          },
        },
      }
    : {};
  const playersPerformance = players.map(async (player) => {
    const groupedMatchesBat = mapGroupedMatches(player.playerBatEvents);
    const batEvents = (player.playerBatEvents ?? []).map(
      (event) => event.type as EventType,
    );

    const noWicketEvents = batEvents.filter((event) => !event.includes("-1"));

    const { runs: runsScored, totalBalls: ballsFaced } = getScore({
      balls: batEvents,
      forBatsman: true,
    });

    const strikeRate = runsScored ? (runsScored / ballsFaced) * 100 : 0;

    const { thirties, fifties, centuries } = calcMilestones(groupedMatchesBat);

    const boundaries = runsScored
      ? noWicketEvents.filter(
          (event) => event.includes("4") || event.includes("6"),
        )
      : [];

    const fours = boundaries.filter((event) => event.includes("4")).length;
    const sixes = boundaries.filter((event) => event.includes("6")).length;

    //// Bowl Stats
    const bowlEvents = (player?.playerBallEvents ?? []).map(
      (event) => event.type as EventType,
    );

    const bowlEventsByMatches = Object.values(
      mapGroupedMatches(player?.playerBallEvents ?? []),
    ).map((events) => events.map((event) => event.type as EventType));

    const maidens = bowlEventsByMatches.reduce(
      (acc, events) => acc + calculateMaidenOvers(events),
      0,
    );

    const {
      runs: runConceded,
      totalBalls: ballsBowled,
      wickets,
      runRate: economy,
    } = getScore({ balls: bowlEvents, forBowler: true });

    //// Field Stats
    const catches = await prisma.ballEvent.count({
      where: {
        userId,
        ...ballEventsFilter,
        OR: [
          { AND: [{ type: "-1_4" }, { bowlerId: player.id }] },
          {
            AND: [
              { type: { contains: player.id } },
              {
                OR: [{ type: { contains: "_3_" } }],
              },
            ],
          },
        ],
      },
    });

    const runOuts = await prisma.ballEvent.count({
      where: {
        userId,
        ...ballEventsFilter,
        AND: [{ type: { contains: "_5_" } }, { type: { contains: player.id } }],
      },
    });

    const stumpings = await prisma.ballEvent.count({
      where: {
        userId,
        ...ballEventsFilter,
        AND: [{ type: { contains: "_6_" } }, { type: { contains: player.id } }],
      },
    });

    return {
      playerId: player.id,
      // Bat
      runsScored,
      ballsFaced,
      strikeRate,
      fours,
      sixes,
      thirties,
      fifties,
      centuries,
      is2: false,
      is3: false,
      isDuck: false,
      // Bowl
      wicketsTaken: wickets,
      ballsBowled,
      runConceded,
      economy,
      maidens,
      // Field
      catches,
      runOuts,
      stumpings,
      // Other
      team: "",
      isWinner: false,
    };
  });

  const mvp = calcBestPerformance({
    playersPerformance: await Promise.all(playersPerformance),
  });

  return (
    <TabsContent value="mvp">
      <Card className="overflow-x-auto">
        <CardHeader>
          <CardTitle>Most Valuable Players</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-primary hover:bg-primary/90">
                <TableHead className="text-primary-foreground">Pos</TableHead>
                <TableHead className="min-w-24 text-primary-foreground">
                  Player
                </TableHead>
                <TableHead className="text-center text-primary-foreground">
                  Points
                </TableHead>
                <TableHead className="text-center text-primary-foreground">
                  Matches
                </TableHead>
                <TableHead className="text-center text-primary-foreground">
                  Runs
                </TableHead>
                <TableHead className="text-center text-primary-foreground">
                  Wickets
                </TableHead>
                <TableHead className="text-center text-primary-foreground">
                  SR
                </TableHead>
                <TableHead className="text-center text-primary-foreground">
                  Economy
                </TableHead>
                <TableHead className="text-center text-primary-foreground">
                  30s
                </TableHead>
                <TableHead className="text-center text-primary-foreground">
                  50s
                </TableHead>
                <TableHead className="text-center text-primary-foreground">
                  100s
                </TableHead>
                <TableHead className="text-center text-primary-foreground">
                  Catches
                </TableHead>
                <TableHead className="text-center text-primary-foreground">
                  Runouts
                </TableHead>
                <TableHead className="text-center text-primary-foreground">
                  Stumpings
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mvp.length ? (
                mvp.map(
                  async (
                    {
                      playerId,
                      points,
                      runsScored,
                      wicketsTaken,
                      economy,
                      strikeRate,
                      thirties,
                      fifties,
                      centuries,
                      catches,
                      runOuts,
                      stumpings,
                    },
                    i,
                  ) => {
                    const matches = await prisma.matchTeam.count({
                      where: {
                        match: ballEventsFilter.Match,
                        team: {
                          teamPlayers: { some: { playerId } },
                        },
                      },
                    });

                    const player = players.find((p) => p.id === playerId);

                    return (
                      <TableRow key={player?.id}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{player?.name}</TableCell>
                        <TableCell className="bg-primary/5 text-center">
                          {points}
                        </TableCell>
                        <TableCell className="text-center">{matches}</TableCell>
                        <TableCell className="text-center">
                          {runsScored}
                        </TableCell>
                        <TableCell className="text-center">
                          {wicketsTaken}
                        </TableCell>
                        <TableCell className="text-center">
                          {strikeRate ? round(strikeRate) : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {economy ? round(economy) : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {thirties}
                        </TableCell>
                        <TableCell className="text-center">{fifties}</TableCell>
                        <TableCell className="text-center">
                          {centuries}
                        </TableCell>
                        <TableCell className="text-center">{catches}</TableCell>
                        <TableCell className="text-center">{runOuts}</TableCell>
                        <TableCell className="text-center">
                          {stumpings}
                        </TableCell>
                      </TableRow>
                    );
                  },
                )
              ) : (
                <TableRow>
                  <TableCell colSpan={12} className="text-center">
                    No records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </TabsContent>
  );
}

export default MVP;
