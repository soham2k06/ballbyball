"use client";

import { useRecords } from "@/api-hooks/use-records";
import { round } from "@/lib/utils";
import { BattingRecordsType } from "@/types";

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

function BattingRecords() {
  const recordsData = useRecords({
    recordType: "batting",
  });

  const records = (recordsData.records || []) as BattingRecordsType[];

  return (
    <TabsContent value="runs">
      {recordsData.isFetching ? (
        <RecordsSkeleton title="Most runs" />
      ) : (
        <Card className="overflow-x-auto">
          <CardHeader>
            <CardTitle>Most runs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary/90 [&>th]:text-center [&>th]:text-primary-foreground">
                  <TableHead className="!text-left">Pos</TableHead>
                  <TableHead className="sticky left-0 min-w-24 bg-primary !text-left">
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
                          <TableCell className="sticky left-0 bg-background">
                            {player.name}
                          </TableCell>
                          <TableCell className="bg-primary/5 text-center">
                            {runs}
                          </TableCell>
                          <TableCell className="text-center">
                            {matches}
                          </TableCell>
                          <TableCell className="text-center">
                            {innings}
                          </TableCell>
                          <TableCell className="text-center">
                            {notOuts}
                          </TableCell>
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
      )}
    </TabsContent>
  );
}

export default BattingRecords;
