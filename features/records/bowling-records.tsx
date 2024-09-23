import { BallEvent, Player } from "@prisma/client";

import {
  calcBestSpells,
  calculateMaidenOvers,
  calcWicketHauls,
  getOverStr,
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

      const groupedMatchesBowl = mapGroupedMatches(player.playerBallEvents);

      const bowlEvents = (player?.playerBallEvents ?? []).map(
        (event) => event.type as EventType,
      );

      const bowlEventsByMatches =
        Object.values(groupedMatchesBowl).map((events) =>
          events.map((event) => event.type as EventType),
        ) || [];

      const bestSpell = calcBestSpells(bowlEventsByMatches, 1)[0];

      const { threes: threeHauls, fives: fiveHauls } =
        calcWicketHauls(groupedMatchesBowl);

      const maidens = bowlEventsByMatches.reduce(
        (acc, events) => acc + calculateMaidenOvers(events),
        0,
      );

      const {
        runs: runsConceded,
        totalBalls,
        wickets,
        runRate,
      } = getScore({ balls: bowlEvents, forBowler: true });

      const dots = bowlEvents.filter((event) => event === "0").length;

      const strikeRate = wickets ? totalBalls / wickets || 0 : 0;

      return {
        player: {
          id: player.id,
          name: player.name,
        },
        wickets,
        totalBalls,
        matches: Object.keys(groupedMatches).length,
        economy: runRate,
        strikeRate,
        maidens,
        threeHauls,
        fiveHauls,
        bestSpell,
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
    .slice(0, 10);

  return (
    <TabsContent value="wickets">
      <Card className="overflow-x-auto">
        <CardHeader>
          <CardTitle>Most Wickets</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-primary hover:bg-primary/90 [&>th]:text-center [&>th]:text-primary-foreground">
                <TableHead className="!text-left">Pos</TableHead>
                <TableHead className="min-w-24 !text-left">Player</TableHead>
                <TableHead>Wickets</TableHead>
                <TableHead>Matches</TableHead>
                <TableHead>Econ.</TableHead>
                <TableHead>Best</TableHead>
                <TableHead>SR</TableHead>
                <TableHead>3W</TableHead>
                <TableHead>5W</TableHead>
                <TableHead>Maidens</TableHead>
                <TableHead>Dots</TableHead>
                <TableHead>Overs</TableHead>
                <TableHead>Runs</TableHead>
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
                      maidens,
                      threeHauls,
                      fiveHauls,
                      runsConceded,
                      totalBalls,
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
                          {bestSpell
                            ? bestSpell.wickets + "/" + bestSpell.runs
                            : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {strikeRate ? round(strikeRate) : "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          {threeHauls}
                        </TableCell>
                        <TableCell className="text-center">
                          {fiveHauls}
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
