import { EventType } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { TabsContent } from "../ui/tabs";
import {
  calcBestSpells,
  calculateMaidenOvers,
  getOverStr,
  getScore,
  mapGroupedMatches,
  round,
} from "@/lib/utils";
import { BallEvent, Player } from "@prisma/client";

function BowlingRecords({
  players,
}: {
  players: (Player & {
    playerBatEvents: BallEvent[];
    playerBallEvents: BallEvent[];
  })[];
}) {
  const records = players
    .map((player) => {
      const groupedMatches = mapGroupedMatches(
        [...player?.playerBatEvents, ...player?.playerBallEvents] ?? [],
      );

      const bowlEvents = (player?.playerBallEvents ?? []).map(
        (event) => event.type as EventType,
      );

      const bowlEventsByMatches =
        Object.values(groupedMatches).map((events) =>
          events
            .filter((event) => event.bowlerId === player.id)
            .map((event) => event.type as EventType),
        ) || [];

      const bestSpell = calcBestSpells(bowlEventsByMatches, 1)[0];

      const {
        runs: runsConceded,
        totalBalls,
        wickets,
        runRate,
      } = getScore({ balls: bowlEvents, forBowler: true });

      const maidens = calculateMaidenOvers(bowlEvents);

      const dots = bowlEvents.filter((event) => event === "0").length;

      const strikeRate = wickets ? totalBalls / wickets || 0 : 0;

      return {
        player: player,
        wickets,
        totalBalls,
        matches: Object.keys(groupedMatches).length,
        economy: runRate,
        strikeRate,
        bestSpell,
        maidens,
        runsConceded,
        dots,
      };
    })
    .sort((a, b) => {
      return a.matches === 0 && b.matches === 0
        ? 0
        : a.matches === 0
          ? 1
          : b.matches === 0
            ? -1
            : b.wickets - a.wickets ||
              a.economy - b.economy ||
              a.matches - b.matches;
    })
    .slice(0, 5);
  return (
    <TabsContent value="wickets">
      <Card className="overflow-x-auto">
        <CardHeader>
          <CardTitle>Most Wickets</CardTitle>
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
                  Wickets
                </TableHead>
                <TableHead className="text-center text-primary-foreground">
                  Matches
                </TableHead>
                <TableHead className="text-center text-primary-foreground">
                  Econ.
                </TableHead>
                <TableHead className="text-center text-primary-foreground">
                  Best
                </TableHead>
                <TableHead className="text-center text-primary-foreground">
                  SR
                </TableHead>
                <TableHead className="text-center text-primary-foreground">
                  Maidens
                </TableHead>
                <TableHead className="text-center text-primary-foreground">
                  Dots
                </TableHead>
                <TableHead className="text-center text-primary-foreground">
                  Overs
                </TableHead>
                <TableHead className="text-center text-primary-foreground">
                  Runs
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.length ? (
                records.map(
                  (
                    {
                      player,
                      matches,
                      wickets,
                      bestSpell,
                      economy,
                      strikeRate,
                      runsConceded,
                      totalBalls,
                      maidens,
                      dots,
                    },
                    i,
                  ) => {
                    return (
                      <TableRow key={player.id}>
                        <TableCell>{i + 1}</TableCell>
                        <TableCell>{player.name}</TableCell>
                        <TableCell className="bg-primary/5 text-center">
                          {wickets}
                        </TableCell>
                        <TableCell className="text-center">{matches}</TableCell>
                        <TableCell className="text-center">
                          {economy ? round(economy) : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {bestSpell ? (
                            <>
                              {bestSpell.wickets}/{bestSpell.runs} (
                              {getOverStr(bestSpell.balls)})
                            </>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {strikeRate ? round(strikeRate) : "-"}
                        </TableCell>
                        <TableCell className="text-center">{maidens}</TableCell>
                        <TableCell className="text-center">{dots}</TableCell>
                        <TableCell className="text-center">
                          {getOverStr(totalBalls)}
                        </TableCell>
                        <TableCell className="text-center">
                          {runsConceded}
                        </TableCell>
                      </TableRow>
                    );
                  },
                )
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="text-center">
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

export default BowlingRecords;
