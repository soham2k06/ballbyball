"use client";

import { useSearchParams } from "next/navigation";

import { useRecords } from "@/api-hooks/use-records";
import {
  calcBestSpells,
  calculateMaidenOvers,
  calcWicketHauls,
  filterRecords,
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

import RecordsSkeleton from "./records-skeleton";

function BowlingRecords() {
  const { records = [], isFetching } = useRecords();

  const sp = useSearchParams();
  const date = sp.get("date");

  const bowlingRecords = records
    .filter((record) => {
      const filteredBatEvents = filterRecords(record?.playerBatEvents, date);
      const filteredBallEvents = filterRecords(record?.playerBallEvents, date);

      return filteredBatEvents.length || filteredBallEvents.length;
    })
    .map((player) => {
      const filteredBatEvents = filterRecords(player?.playerBatEvents, date);
      const filteredBallEvents = filterRecords(player?.playerBallEvents, date);

      const groupedMatches = mapGroupedMatches([
        ...filteredBatEvents,
        ...filteredBallEvents,
      ]);

      const groupedMatchesBowl = mapGroupedMatches(filteredBallEvents);

      const bowlEvents = (filteredBallEvents ?? []).map(
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
      {isFetching ? (
        <RecordsSkeleton title="Most Wickets" />
      ) : (
        <Card className="overflow-x-auto">
          <CardHeader>
            <CardTitle>Most Wickets</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary/90 [&>th]:text-center [&>th]:text-primary-foreground">
                  <TableHead className="!text-left">Pos</TableHead>
                  <TableHead className="sticky left-0 min-w-24 bg-primary !text-left">
                    Player
                  </TableHead>
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
                {bowlingRecords.length ? (
                  bowlingRecords.map(
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
                          <TableCell className="sticky left-0 bg-background">
                            {player.name}
                          </TableCell>
                          <TableCell className="bg-primary/5 text-center">
                            {wickets}
                          </TableCell>
                          <TableCell className="text-center">
                            {matches}
                          </TableCell>
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
                          <TableCell className="text-center">
                            {maidens}
                          </TableCell>
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
      )}
    </TabsContent>
  );
}

export default BowlingRecords;
