"use client";

import { useState } from "react";

import { useRecords } from "@/api-hooks/use-records";
import { addAnalytics } from "@/lib/actions/app-analytics";
import {
  calcMilestones,
  getScore,
  mapGroupedMatches,
  round,
} from "@/lib/utils";
import { RecordsProps } from "@/types";

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

import OverallBattingRecords from "./overall-batting-records";
import RecordsSkeleton from "./records-skeleton";

function BattingRecords({ date, matches }: RecordsProps) {
  const { records = [], isFetching } = useRecords({
    matches,
    date,
  });

  const battingRecords = records
    .map((player) => {
      const groupedInnings = mapGroupedMatches(player.playerBatEvents ?? []);
      const innings = player.inningsPlayed;
      const batEvents = player.playerBatEvents.map((event) => event.type);

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
        matchesPlayed: player.matchesPlayed,
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
        b.matchesPlayed - a.matchesPlayed,
    );

  const [numRecordsToShow, setNumRecordsToShow] = useState(10);

  const recordsToShow = battingRecords.slice(0, numRecordsToShow);

  function handleShowAll() {
    addAnalytics({
      event: "click",
      module: "stats",
      property: "btn-show_all_batting_records",
    });
    setNumRecordsToShow(battingRecords.length);
  }

  return (
    <TabsContent value="runs">
      {isFetching ? (
        <RecordsSkeleton title="Most runs" />
      ) : (
        <Card className="overflow-x-auto">
          <CardHeader>
            <CardTitle>Most runs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="group bg-primary hover:bg-primary/90 [&>th]:text-center [&>th]:text-primary-foreground">
                  <TableHead className="!text-left">Pos</TableHead>
                  <TableHead className="sticky left-0 min-w-24 bg-primary !text-left transition-colors group-hover:bg-[#3d72ed]">
                    Player
                  </TableHead>
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
                {recordsToShow.length ? (
                  recordsToShow.map(
                    (
                      {
                        player,
                        runs,
                        matchesPlayed,
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
                        <TableRow
                          key={player.id}
                          className="group hover:bg-secondary"
                        >
                          <TableCell>{i + 1}</TableCell>
                          <TableCell className="sticky left-0 bg-background duration-300 group-hover:bg-secondary">
                            {player.name}
                          </TableCell>
                          <TableCell className="bg-primary/5 text-center">
                            {runs}
                          </TableCell>
                          <TableCell className="text-center">
                            {matchesPlayed}
                          </TableCell>
                          <TableCell className="text-center">
                            {innings}
                          </TableCell>
                          <TableCell className="text-center">
                            {notOuts}
                          </TableCell>
                          <TableCell className="text-center">
                            {milestones.highestScore.runs}
                            {milestones.highestScore.isNotout ? "*" : ""}
                          </TableCell>
                          <TableCell className="text-center">
                            {innings
                              ? average === Infinity
                                ? "N/A"
                                : round(average, 1)
                              : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {Math.round(strikeRate)}
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
            <div className="flex flex-col">
              {battingRecords.length > numRecordsToShow && (
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
      <OverallBattingRecords
        battingRecords={battingRecords}
        isFetching={isFetching}
      />
    </TabsContent>
  );
}

export default BattingRecords;
