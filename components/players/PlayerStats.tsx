import { usePlayerStats } from "@/apiHooks/player";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { Skeleton } from "../ui/skeleton";

function PlayerStats({
  openedPlayer,
  setOpenedPlayer,
}: {
  openedPlayer:
    | {
        id: string | undefined;
        name: string | undefined;
      }
    | undefined;
  setOpenedPlayer: (playerId: string | undefined) => void;
}) {
  const playerId = openedPlayer?.id;
  const playerName = openedPlayer?.name;
  const { data } = usePlayerStats(playerId);

  const matchesPlayed = data?.matchesPlayed;

  const batStrikeRate =
    Math.round(
      ((data?.batting.runs ?? 0) / (data?.batting.balls ?? 1)) * 1000,
    ) / 10;

  const isNotOutYet = data?.batting.wickets === 0;
  const batAverage = (data?.batting.runs ?? 0) / (matchesPlayed ?? 0) ?? 0;

  return (
    <Dialog
      open={!!playerId}
      onOpenChange={() => setOpenedPlayer(playerId ? undefined : playerId)}
    >
      <DialogContent>
        <DialogHeader className="flex-row items-center gap-4 space-y-0">
          <div className="text-lg font-bold">{playerName}</div>
          <div className="text-sm font-bold">Matches - {matchesPlayed}</div>
        </DialogHeader>
        {data ? (
          <div className="overflow-hidden rounded-md">
            <div className="mb-1 bg-primary p-2 text-primary-foreground">
              <h4 className="text-lg font-semibold md:text-xl">Batting</h4>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <Stat data={data.batting.runs} dataKey="Runs" />
              <Stat
                data={matchesPlayed ? batAverage : "-"}
                dataKey="Average"
                showStar={isNotOutYet && (matchesPlayed ?? 0) > 0}
              />
              <Stat
                data={data.batting.balls ? batStrikeRate : "-"}
                dataKey="Strike rate"
              />
              <Stat data={data.batting.fifties} dataKey="Fifties" />
              <Stat data={data.batting.centuries} dataKey="Centuries" />
              <Stat data={data.batting.highestScore} dataKey="High. Score" />
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md">
            <div className="mb-1 bg-primary p-2 text-primary-foreground">
              <h4 className="text-lg font-semibold md:text-xl">Batting</h4>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <Stat skeleton data={0} dataKey="Runs" />
              <Stat
                skeleton
                data={matchesPlayed ? batAverage : "-"}
                dataKey="Average"
                showStar={isNotOutYet && (matchesPlayed ?? 0) > 0}
              />
              <Stat skeleton data="-" dataKey="Strike rate" />
              <Stat skeleton data={0} dataKey="Fifties" />
              <Stat skeleton data={0} dataKey="Centuries" />
              <Stat skeleton data={0} dataKey="High. Score" />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({
  data,
  dataKey,
  showStar,
  skeleton,
}: {
  dataKey: string;
  data: number | "-";
  showStar?: boolean;
  skeleton?: boolean;
}) {
  return (
    <div className="bg-muted p-2">
      <h5 className="font-semibold uppercase text-muted-foreground max-md:text-sm">
        {dataKey}
      </h5>
      {skeleton ? (
        <Skeleton className="h-8 w-20 bg-muted-foreground max-md:h-7" />
      ) : (
        <p className="text-2xl font-bold max-md:text-xl">
          {data}
          {showStar && "*"}
        </p>
      )}
    </div>
  );
}

export default PlayerStats;
