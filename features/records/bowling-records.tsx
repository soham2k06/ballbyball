"use client";

import { useRecords } from "@/api-hooks/use-records";
import { getOverStr, round } from "@/lib/utils";
import { BowlingRecordsType } from "@/types";

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
  const recordsData = useRecords({
    recordType: "bowling",
  });

  const records = (recordsData.records || []) as BowlingRecordsType[];

  return (
    <TabsContent value="wickets">
      {recordsData.isFetching ? (
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
