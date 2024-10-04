import { useRecords } from "@/api-hooks/use-records";
import { calcBestPerformance, round } from "@/lib/utils";
import { PlayerPerformance } from "@/types";

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

function MVP() {
  const recordsData = useRecords({
    recordType: "mvp",
  });

  const records = (recordsData.records || []) as (PlayerPerformance & {
    name: string;
    matches: number;
  })[];

  const calculateMVP = (
    player: (PlayerPerformance & {
      name: string;
      matches: number;
    })[],
  ) => {
    const performance = calcBestPerformance({ playersPerformance: player });
    return performance.map((p) => {
      const curRecord = records.find(
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

  const mvp = calculateMVP(records);

  return (
    <TabsContent value="mvp">
      {recordsData.isFetching ? (
        <RecordsSkeleton title="Most Valuable Players" />
      ) : (
        <Card className="overflow-x-auto">
          <CardHeader>
            <CardTitle>Most Valuable Players</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="bg-primary hover:bg-primary/90 [&>th]:text-center [&>th]:text-primary-foreground">
                  <TableHead className="!text-left">Pos</TableHead>
                  <TableHead className="min-w-24 !text-left">Player</TableHead>
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
                {mvp.length ? (
                  mvp.map(
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
                        <TableRow key={playerId} className="[&>td]:text-center">
                          <TableCell className="!text-left">{i + 1}</TableCell>
                          <TableCell className="!text-left">{name}</TableCell>
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
          </CardContent>
        </Card>
      )}
    </TabsContent>
  );
}

export default MVP;
