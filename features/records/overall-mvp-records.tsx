import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function OverallMVPRecords({
  mvp,
  isFetching,
}: {
  mvp: {
    catches: number;
    runOuts: number;
    stumpings: number;
  }[];
  isFetching: boolean;
}) {
  const allRecords = mvp.reduce(
    (acc, { catches, runOuts, stumpings }) => {
      acc.catches += catches;
      acc.runOuts += runOuts;
      acc.stumpings += stumpings;

      return acc;
    },
    {
      catches: 0,
      runOuts: 0,
      stumpings: 0,
    },
  );

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Overall Stats</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        <StatCard
          isFetching={isFetching}
          title="Catches"
          stat={allRecords.catches}
        />
        <StatCard
          isFetching={isFetching}
          title="Runouts"
          stat={allRecords.runOuts}
        />
        <StatCard
          isFetching={isFetching}
          title="Stumpings"
          stat={allRecords.stumpings}
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

export default OverallMVPRecords;
