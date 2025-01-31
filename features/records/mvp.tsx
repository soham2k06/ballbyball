"use client";

import { useState } from "react";

import { useRecords } from "@/api-hooks/use-records";
import { addAnalytics } from "@/lib/actions/app-analytics";
import { calcBestPerformance, getMVP, round } from "@/lib/utils";
import { PlayerPerformance, RecordsProps } from "@/types";

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

import OverallMVPRecords from "./overall-mvp-records";
import RecordsSkeleton from "./records-skeleton";

function MVP({ date, matches }: RecordsProps) {
  const { records = [], isFetching } = useRecords({ matches, date });

  const mvpRecords = getMVP(records);

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

  function handleShowAll() {
    addAnalytics({
      event: "click",
      module: "stats",
      property: "btn-show_all_mvp_records",
    });
    setNumRecordsToShow(mvp.length);
  }

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
                          className="group hover:bg-secondary [&>td]:text-center"
                        >
                          <TableCell className="!text-left">{i + 1}</TableCell>
                          <TableCell className="sticky left-0 bg-background !text-left duration-300 group-hover:bg-secondary">
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
                  onClick={handleShowAll}
                >
                  Show all
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      <OverallMVPRecords mvp={mvp} isFetching={isFetching} />
    </TabsContent>
  );
}

export default MVP;
