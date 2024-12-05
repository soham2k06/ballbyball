import { round } from "@/lib/utils";
import { BowlingRecordsType } from "@/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function OverallBowlingRecords({
  bowlingRecords,
  isFetching,
}: {
  bowlingRecords: BowlingRecordsType[];
  isFetching: boolean;
}) {
  const allRecords = bowlingRecords.reduce(
    (
      acc,
      {
        wickets,
        bestSpell,
        player,
        dots,
        economy,
        fiveHauls,
        maidens,
        runsConceded,
        strikeRate,
        threeHauls,
        hattricks,
      },
    ) => {
      acc.wickets += wickets;
      acc.dots += dots;
      acc.economy += economy;
      acc.fiveHauls += fiveHauls;
      acc.maidens += maidens;
      acc.runsConceded += runsConceded;
      acc.strikeRate += strikeRate;
      acc.threeHauls += threeHauls;
      acc.hattricks += hattricks;

      if (bestSpell.wickets === acc.bestSpell.wickets) {
        if (bestSpell.runs < acc.bestSpell.runs) {
          acc.bestSpell = {
            ...bestSpell,
            playerName: player.name,
          };
        }
      }
      if (bestSpell.wickets > acc.bestSpell.wickets) {
        acc.bestSpell = {
          ...bestSpell,
          playerName: player.name,
        };
      }

      return acc;
    },
    {
      wickets: 0,
      bestSpell: { wickets: 0, runs: 0, playerName: "" },
      dots: 0,
      economy: 0,
      fiveHauls: 0,
      maidens: 0,
      runsConceded: 0,
      strikeRate: 0,
      threeHauls: 0,
      hattricks: 0,
    },
  );

  const bestSpell = allRecords.bestSpell;

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Overall Stats</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <StatCard
          isFetching={isFetching}
          title="Wickets"
          stat={allRecords.wickets}
        />
        <StatCard
          isFetching={isFetching}
          title="Economy"
          stat={round(allRecords.economy / bowlingRecords.length)}
        />
        <StatCard
          isFetching={isFetching}
          title="Balls per wicket"
          stat={round(allRecords.strikeRate / bowlingRecords.length)}
        />
        <StatCard
          isFetching={isFetching}
          title="Best"
          stat={`${bestSpell.wickets}/${bestSpell.runs} by ${bestSpell.playerName}`}
        />
        <StatCard isFetching={isFetching} title="Dots" stat={allRecords.dots} />
        <StatCard
          isFetching={isFetching}
          title="Maidens"
          stat={allRecords.maidens}
        />
        <StatCard
          isFetching={isFetching}
          title="3 wickets"
          stat={allRecords.threeHauls}
        />
        <StatCard
          isFetching={isFetching}
          title="5 wickets"
          stat={allRecords.fiveHauls}
        />
        <StatCard
          isFetching={isFetching}
          title="Hattricks"
          stat={allRecords.hattricks}
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
        <p className="truncate text-xl font-semibold">{stat}</p>
      )}
    </div>
  );
}

export default OverallBowlingRecords;
