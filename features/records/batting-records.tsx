import { BallEvent, Player } from "@prisma/client";

import {
  calcMilestones,
  getScore,
  mapGroupedMatches,
  round,
} from "@/lib/utils";

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

function BattingRecords({
  players,
}: {
  players: (Player & {
    playerBatEvents: BallEvent[];
    playerBallEvents: BallEvent[];
  })[];
}) {
  const records = players
    .map((player) => {
      const groupedMatches = mapGroupedMatches([
        ...player?.playerBatEvents,
        ...player?.playerBallEvents,
      ]);
      const groupedInnings = mapGroupedMatches(player?.playerBatEvents ?? []);
      const innings = Object.keys(groupedInnings).length;
      const batEvents = (player?.playerBatEvents).map((event) => event.type);

      const milestones = calcMilestones(groupedInnings);

      const {
        runs,
        totalBalls: ballsFaced,
        wickets,
      } = getScore({
        balls: batEvents,
        forBatsman: true,
      });

      const average = runs / wickets || 0;
      const strikeRate = (runs / ballsFaced) * 100 || 0;

      const noWicketEvents = batEvents.filter((event) => !event.includes("-1"));
      const fours = noWicketEvents.filter((event) =>
        event.includes("4"),
      ).length;
      const sixes = noWicketEvents.filter((event) =>
        event.includes("6"),
      ).length;

      const notOuts = Object.values(groupedInnings).reduce((acc, events) => {
        const isNotOut = !events.some((evt) => evt.type.includes("-1"));
        return isNotOut ? acc + 1 : acc;
      }, 0);

      return {
        player: {
          id: player.id,
          name: player.name,
        },
        runs,
        ballsFaced,
        matches: Object.keys(groupedMatches).length,
        innings,
        milestones,
        average,
        strikeRate,
        notOuts,
        fours,
        sixes,
      };
    })
    .sort(
      (a, b) =>
        b.runs - a.runs ||
        b.strikeRate - a.strikeRate ||
        b.innings - a.innings ||
        b.matches - a.matches,
    )
    .slice(0, 10);

  return (
    <TabsContent value="runs">
      <Card className="overflow-x-auto">
        <CardHeader>
          <CardTitle>Most runs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-primary hover:bg-primary/90 [&>th]:text-center [&>th]:text-primary-foreground">
                <TableHead className="!text-left">Pos</TableHead>
                <TableHead className="min-w-24 !text-left">Player</TableHead>
                <TableHead>Runs</TableHead>
                <TableHead>Matches</TableHead>
                <TableHead>Innings</TableHead>
                <TableHead>NO</TableHead>
                <TableHead>Best</TableHead>
                <TableHead>AVG</TableHead>
                <TableHead>SR</TableHead>
                <TableHead>BF</TableHead>
                <TableHead>30s</TableHead>
                <TableHead>50s</TableHead>
                <TableHead>100s</TableHead>
                <TableHead>4s</TableHead>
                <TableHead>6s</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length ? (
                records.map(
                  (
                    {
                      player,
                      runs,
                      matches,
                      innings,
                      milestones,
                      ballsFaced,
                      notOuts,
                      average,
                      strikeRate,
                      fours,
                      sixes,
                    },
                    i,
                  ) => {
                    return (
                      <TableRow key={player.id}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{player.name}</TableCell>
                        <TableCell className="bg-primary/5 text-center">
                          {runs}
                        </TableCell>
                        <TableCell className="text-center">{matches}</TableCell>
                        <TableCell className="text-center">{innings}</TableCell>
                        <TableCell className="text-center">{notOuts}</TableCell>
                        <TableCell className="text-center">
                          {milestones.highestScore}
                          {milestones.isNotout ? "*" : ""}
                        </TableCell>
                        <TableCell className="text-center">
                          {innings
                            ? average === Infinity
                              ? "N/A"
                              : round(average)
                            : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {round(strikeRate)}
                        </TableCell>
                        <TableCell className="text-center">
                          {ballsFaced}
                        </TableCell>
                        <TableCell className="text-center">
                          {milestones.thirties}
                        </TableCell>
                        <TableCell className="text-center">
                          {milestones.fifties}
                        </TableCell>
                        <TableCell className="text-center">
                          {milestones.centuries}
                        </TableCell>
                        <TableCell className="text-center">{fours}</TableCell>
                        <TableCell className="text-center">{sixes}</TableCell>
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

export default BattingRecords;
