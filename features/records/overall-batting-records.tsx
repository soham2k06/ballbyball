import { round } from "@/lib/utils";
import { BattingRecordsType } from "@/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function OverallBattingRecords({
  battingRecords,
  isFetching,
}: {
  battingRecords: BattingRecordsType[];
  isFetching: boolean;
}) {
  const allRecords = battingRecords.reduce(
    (
      acc,
      { runs, ballsFaced, fours, sixes, milestones, player, innings, notOuts },
    ) => {
      const outs = innings - notOuts;
      acc.runs += runs;
      acc.balls += ballsFaced;
      acc.outs += outs;
      acc.fours += fours;
      acc.sixes += sixes;
      acc.thirties += milestones.thirties;
      acc.fifties += milestones.fifties;
      acc.hundreds += milestones.centuries;
      if (milestones.highestScore > acc.highestScore.runs) {
        acc.highestScore = {
          runs: milestones.highestScore,
          isNotOut: milestones.isNotout,
          playerName: player.name,
        };
      }
      return acc;
    },
    {
      runs: 0,
      balls: 0,
      outs: 0,
      fours: 0,
      sixes: 0,
      thirties: 0,
      fifties: 0,
      hundreds: 0,
      highestScore: { runs: 0, isNotOut: false, playerName: "" },
      strikeRate: 0,
    },
  );

  const highestScore = allRecords.highestScore;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Overall Stats</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <StatCard
          isFetching={isFetching}
          title="Total runs"
          stat={allRecords.runs}
        />
        <StatCard
          isFetching={isFetching}
          title="Strike rate"
          stat={round((allRecords.runs / allRecords.balls) * 100)}
        />
        <StatCard
          isFetching={isFetching}
          title="Average"
          stat={round(allRecords.runs / allRecords.outs)}
        />
        <StatCard
          isFetching={isFetching}
          title="Best"
          stat={`${highestScore.runs}${highestScore.isNotOut ? "*" : ""} by ${highestScore.playerName}`}
        />
        <StatCard
          isFetching={isFetching}
          title="Fours"
          stat={allRecords.fours}
        />
        <StatCard
          isFetching={isFetching}
          title="Sixes"
          stat={allRecords.sixes}
        />
        <StatCard
          isFetching={isFetching}
          title="Thirties"
          stat={allRecords.thirties}
        />
        <StatCard
          isFetching={isFetching}
          title="Fifties"
          stat={allRecords.fifties}
        />
        <StatCard
          isFetching={isFetching}
          title="Hundreds"
          stat={allRecords.hundreds}
        />
      </CardContent>
    </Card>
  );
}

function StatCard({
  title,
  stat,
  isFetching,
}: {
  title: string;
  stat: string | number | undefined;
  isFetching: boolean;
}) {
  return (
    <div className="rounded-md bg-muted p-2">
      <h3 className="font-semibold text-muted-foreground">{title}</h3>
      {isFetching ? (
        <Skeleton className="h-5 w-20 bg-primary/10" />
      ) : (
        <p className="text-xl font-semibold">{stat}</p>
      )}
    </div>
  );
}

export default OverallBattingRecords;
