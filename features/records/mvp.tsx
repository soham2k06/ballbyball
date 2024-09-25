import { BallEvent, Player } from "@prisma/client";

import {
  calcBestPerformance,
  calcMilestones,
  calculateMaidenOvers,
  getScore,
  mapGroupedMatches,
  round,
} from "@/lib/utils";
import { EventType, PlayerPerformance } from "@/types";

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

function MVP({
  players,
}: {
  players: (Player & {
    playerBatEvents: BallEvent[];
    playerBallEvents: BallEvent[];
    catches: number;
    runOuts: number;
    stumpings: number;
  })[];
}) {
  const playersPerformance = players.map((player) => {
    const groupedMatchesBat = mapGroupedMatches(player.playerBatEvents);
    const batEvents = (player.playerBatEvents ?? []).map(
      (event) => event.type as EventType,
    );

    const groupedMatches = mapGroupedMatches([
      ...player?.playerBatEvents,
      ...player?.playerBallEvents,
    ]);

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

    const maidens = bowlEventsByMatches.reduce((acc, events) => {
      const maidensForMatch = calculateMaidenOvers(events);
      return acc + maidensForMatch;
    }, 0);

    const {
      runs: runConceded,
      totalBalls: ballsBowled,
      wickets,
      runRate: economy,
    } = getScore({ balls: bowlEvents, forBowler: true });

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
      catches: player.catches,
      runOuts: player.runOuts,
      stumpings: player.stumpings,
      // Other
      team: "",
      isWinner: false,
      matches: Object.keys(groupedMatches).length,
    };
  });

  const calculateMVP = (
    player: (PlayerPerformance & {
      matches: number;
    })[],
  ) => {
    const performance = calcBestPerformance({ playersPerformance: player });
    return performance.map((p) => {
      const matches = playersPerformance.find(
        (player) => player.playerId === p.playerId,
      )?.matches;

      const ppm = matches ? (p.points ?? 0) / matches : 0;

      return {
        ...p,
        matches,
        ppm,
      };
    });
  };

  const mvp = calculateMVP(playersPerformance);

  return (
    <TabsContent value="mvp">
      <Card className="overflow-x-auto">
        <CardHeader>
          <CardTitle>Most Valuable Players</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-primary hover:bg-primary/90 [&>th]:text-center [&>th]:text-primary-foreground">
                <TableHead className="!text-left">Pos</TableHead>
                <TableHead className="min-w-24 !text-left">Player</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Matches</TableHead>
                <TableHead>AVG</TableHead>
                <TableHead>Runs</TableHead>
                <TableHead>Wickets</TableHead>
                <TableHead>50s</TableHead>
                <TableHead>100s</TableHead>
                <TableHead>Catches</TableHead>
                <TableHead>Runouts</TableHead>
                <TableHead>Stumps</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mvp.length ? (
                mvp.map(
                  (
                    {
                      playerId,
                      points,
                      runsScored,
                      wicketsTaken,
                      fifties,
                      centuries,
                      matches,
                      catches,
                      runOuts,
                      stumpings,
                      ppm,
                    },
                    i,
                  ) => {
                    const player = players.find((p) => p.id === playerId);

                    return (
                      <TableRow key={player?.id} className="[&>td]:text-center">
                        <TableCell className="!text-left">{i + 1}</TableCell>
                        <TableCell className="!text-left">
                          {player?.name}
                        </TableCell>
                        <TableCell className="bg-primary/5">{points}</TableCell>
                        <TableCell>{matches}</TableCell>
                        <TableCell>{ppm ? round(ppm) : 0}</TableCell>
                        <TableCell>{runsScored}</TableCell>
                        <TableCell>{wicketsTaken}</TableCell>
                        <TableCell>{fifties}</TableCell>
                        <TableCell>{centuries}</TableCell>
                        <TableCell>{catches}</TableCell>
                        <TableCell>{runOuts}</TableCell>
                        <TableCell>{stumpings}</TableCell>
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
