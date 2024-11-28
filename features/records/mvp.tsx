"use client";

import { useState } from "react";

import { useRecords } from "@/api-hooks/use-records";
import {
  calcBestPerformance,
  calcMilestones,
  calculateMaidenOvers,
  filterRecords,
  getScore,
  mapGroupedMatches,
  round,
} from "@/lib/utils";
import { EventType, PlayerPerformance, RecordsProps } from "@/types";

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

import RecordsSkeleton from "./records-skeleton";

function MVP({ date, matches }: RecordsProps) {
  const { records = [], isFetching } = useRecords({ matches, date });

  const mvpRecords = records.map((player) => {
    const filteredBatEvents = filterRecords(player?.playerBatEvents, date);
    const filteredBallEvents = filterRecords(player?.playerBallEvents, date);
    const filteredFieldEvents = filterRecords(player?.playerFieldEvents, date);

    const groupedMatchesBat = mapGroupedMatches(filteredBatEvents);
    const batEvents = (filteredBatEvents ?? []).map(
      (event) => event.type as EventType,
    );

    const groupedMatches = mapGroupedMatches([
      ...filteredBatEvents,
      ...filteredBallEvents,
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
    const bowlEvents = (filteredBallEvents ?? []).map(
      (event) => event.type as EventType,
    );

    const bowlEventsByMatches = Object.values(
      mapGroupedMatches(filteredBallEvents ?? []),
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

    //// Field Stats
    const catches = filteredFieldEvents.filter(
      (event) => event.type.includes("-1_3") || event.type.includes("-1_4"),
    ).length;

    const runOuts = filteredFieldEvents.filter((event) =>
      event.type.includes("-1_5"),
    ).length;

    const stumpings = filteredFieldEvents.filter((event) =>
      event.type.includes("-1_6"),
    ).length;

    return {
      name: player.name,
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
      matches: Object.keys(groupedMatches).length,
    };
  });

  const calculateMVP = (
    player: (PlayerPerformance & {
      name: string;
      matches: number;
    })[],
  ) => {
    const performance = calcBestPerformance({ playersPerformance: player });
    return performance.map((p) => {
      const curRecord = mvpRecords.find(
        (record) => record.playerId === p.playerId,
      );
      const matches = curRecord?.matches ?? 0;
      const name = curRecord?.name ?? "";

      const ppm = matches ? (p.points ?? 0) / matches : 0;

      return {
        ...p,
        matches,
        name,
        ppm,
      };
    });
  };

  const mvp = calculateMVP(mvpRecords);

  const [numRecordsToShow, setNumRecordsToShow] = useState(10);

  const recordsToShow = mvp.slice(0, numRecordsToShow);

  return (
    <TabsContent value="mvp">
      {isFetching ? (
        <RecordsSkeleton title="Most Valuable Players" />
      ) : (
        <Card className="overflow-x-auto">
          <CardHeader>
            <CardTitle>Most Valuable Players</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="group bg-primary hover:bg-primary/90 [&>th]:text-center [&>th]:text-primary-foreground">
                  <TableHead className="!text-left">Pos</TableHead>
                  <TableHead className="sticky left-0 min-w-24 bg-primary !text-left transition-colors group-hover:bg-[#3d72ed]">
                    Player
                  </TableHead>
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
                {recordsToShow.length ? (
                  recordsToShow.map(
                    (
                      {
                        name,
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
                      return (
                        <TableRow
                          key={playerId}
                          className="group [&>td]:text-center"
                        >
                          <TableCell className="!text-left">{i + 1}</TableCell>
                          <TableCell className="sticky left-0 bg-background !text-left duration-300 group-hover:bg-muted">
                            {name}
                          </TableCell>
                          <TableCell className="bg-primary/5">
                            {points}
                          </TableCell>
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
            <div className="flex flex-col">
              {mvp.length > numRecordsToShow && (
                <Button
                  className="mt-4 w-full max-w-sm self-center"
                  onClick={() => setNumRecordsToShow(mvp.length)}
                >
                  Show all
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </TabsContent>
  );
}

export default MVP;
