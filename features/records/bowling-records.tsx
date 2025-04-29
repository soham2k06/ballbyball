"use client";

import { useState } from "react";

import { useRecords } from "@/api-hooks/use-records";
import { addAnalytics } from "@/lib/actions/app-analytics";
import {
  calcBestSpells,
  calculateMaidenOvers,
  calcWicketHauls,
  countHatTricks,
  getOverStr,
  getScore,
  mapGroupedMatches,
  round,
} from "@/lib/utils";
import { EventType, RecordsProps } from "@/types";

import { Button } from "@/components/ui/button";
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

import OverallBowlingRecords from "./overall-bowling-records";
import RecordsSkeleton from "./records-skeleton";

function BowlingRecords({ date, matches }: RecordsProps) {
  const { records = [], isFetching } = useRecords({ matches, date });

  const bowlingRecords = records
    .map((player) => {
      const groupedMatchesBowl = mapGroupedMatches(player.playerBallEvents);

      const bowlEvents = (player.playerBallEvents ?? []).map(
        (event) => event.type as EventType,
      );

      const bowlEventsByMatches =
        Object.values(groupedMatchesBowl).map((events) =>
          events.map((event) => event.type as EventType),
        ) || [];

      const bestSpell = calcBestSpells(bowlEventsByMatches, 1)[0];

      const {
        threes: threeHauls,
        fours: fourHauls,
        fives: fiveHauls,
      } = calcWicketHauls(groupedMatchesBowl);

      const maidens = bowlEventsByMatches.reduce(
        (acc, events) => acc + calculateMaidenOvers(events),
        0,
      );

      const hattricks = Object.values(groupedMatchesBowl)
        .map((events) =>
          countHatTricks(events.map((event) => event.type as string)),
        )
        .reduce((acc, curr) => acc + curr, 0);

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
        matchesPlayed: player.matchesPlayed,
        wickets,
        totalBalls,
        economy: runRate,
        strikeRate,
        maidens,
        threeHauls,
        fourHauls,
        fiveHauls,
        bestSpell,
        runsConceded,
        dots,
        hattricks,
      };
    })
    .sort((a, b) => {
      return a.matchesPlayed === 0 && b.matchesPlayed === 0
        ? 0
        : a.matchesPlayed === 0
          ? 1
          : b.matchesPlayed === 0
            ? -1
            : b.wickets - a.wickets ||
              a.economy - b.economy ||
              a.matchesPlayed - b.matchesPlayed;
    });

  const [numRecordsToShow, setNumRecordsToShow] = useState(10);

  const recordsToShow = bowlingRecords.slice(0, numRecordsToShow);

  function handleShowAll() {
    addAnalytics({
      event: "click",
      module: "stats",
      property: "btn-show_all_bowling_records",
    });
    setNumRecordsToShow(bowlingRecords.length);
  }

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
                <TableRow className="group bg-primary hover:bg-primary/90 [&>th]:text-center [&>th]:text-primary-foreground">
                  <TableHead className="!text-left">Pos</TableHead>
                  <TableHead className="sticky left-0 min-w-24 bg-primary !text-left transition-colors group-hover:bg-[#3d72ed]">
                    Player
                  </TableHead>
                  <TableHead>Wickets</TableHead>
                  <TableHead>Matches</TableHead>
                  <TableHead>Econ.</TableHead>
                  <TableHead>Best</TableHead>
                  <TableHead>SR</TableHead>
                  <TableHead>3W</TableHead>
                  <TableHead>4W</TableHead>
                  <TableHead>5W</TableHead>
                  <TableHead>Hattricks</TableHead>
                  <TableHead>Maidens</TableHead>
                  <TableHead>Dots</TableHead>
                  <TableHead>Overs</TableHead>
                  <TableHead>Runs</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recordsToShow.length ? (
                  recordsToShow.map(
                    (
                      {
                        player,
                        matchesPlayed,
                        wickets,
                        bestSpell,
                        economy,
                        strikeRate,
                        maidens,
                        threeHauls,
                        fourHauls,
                        fiveHauls,
                        runsConceded,
                        totalBalls,
                        dots,
                        hattricks,
                      },
                      i,
                    ) => {
                      return (
                        <TableRow
                          key={player.id}
                          className="group hover:bg-secondary"
                        >
                          <TableCell>{i + 1}</TableCell>
                          <TableCell className="sticky left-0 bg-background duration-300 group-hover:bg-secondary">
                            {player.name}
                          </TableCell>
                          <TableCell className="bg-primary/5 text-center">
                            {wickets}
                          </TableCell>
                          <TableCell className="text-center">
                            {matchesPlayed}
                          </TableCell>
                          <TableCell className="text-center">
                            {economy ? round(economy, 1) : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {bestSpell
                              ? `${bestSpell.wickets}/${bestSpell.runs}`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {strikeRate ? round(strikeRate, 1) : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {threeHauls}
                          </TableCell>
                          <TableCell className="text-center">
                            {fourHauls}
                          </TableCell>
                          <TableCell className="text-center">
                            {fiveHauls}
                          </TableCell>
                          <TableCell className="text-center">
                            {hattricks}
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
            <div className="flex flex-col">
              {bowlingRecords.length > numRecordsToShow && (
                <Button
                  className="mt-4 w-full max-w-sm self-center"
                  onClick={handleShowAll}
                >
                  Show all
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      <OverallBowlingRecords
        bowlingRecords={bowlingRecords}
        isFetching={isFetching}
      />
    </TabsContent>
  );
}

export default BowlingRecords;
