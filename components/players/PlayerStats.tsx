import { usePlayerStats } from "@/apiHooks/player";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { Skeleton } from "../ui/skeleton";
import { getOverStr, round } from "@/lib/utils";

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
      ((data?.batting.runs ?? 0) / (data?.batting.balls ?? 1)) * 10000,
    ) / 100;

  const isNotOutYet = data?.batting.wickets === 0;
  const batAverage = (data?.batting.runs ?? 0) / (matchesPlayed ?? 0) ?? 0;

  const economy = ((data?.bowling.runs ?? 0) / (data?.bowling.balls ?? 0)) * 6;

  const wicketsTaken = data?.bowling.wickets;
  const ballStrikeRate = (data?.bowling.balls ?? 0) / (wicketsTaken ?? 0);

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
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl">
              <div className="mb-1 bg-primary p-2 text-primary-foreground">
                <h4 className="text-lg font-semibold md:text-xl">Batting</h4>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <Stat data={data.batting.runs} dataKey="Runs" />
                <Stat
                  data={matchesPlayed ? round(batAverage) : "-"}
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
            <div className="overflow-hidden rounded-xl">
              <div className="mb-1 bg-primary p-2 text-primary-foreground">
                <h4 className="text-lg font-semibold md:text-xl">Bowling</h4>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <Stat data={getOverStr(data.bowling.balls)} dataKey="Overs" />
                <Stat data={data.bowling.runs} dataKey="Runs" />
                <Stat data={data.bowling.wickets} dataKey="Wickets" />
                <Stat data={data.bowling.maidenOvers} dataKey="Maidens" />
                <Stat data={round(economy) || "-"} dataKey="Economy" />
                <Stat
                  data={
                    wicketsTaken && ballStrikeRate ? round(ballStrikeRate) : "-"
                  }
                  dataKey="Strike rate"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl">
              <div className="mb-1 bg-primary p-2 text-primary-foreground">
                <h4 className="text-lg font-semibold md:text-xl">Batting</h4>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <Stat skeleton data={0} dataKey="Runs" />
                <Stat skeleton data={0} dataKey="Average" />
                <Stat skeleton data="-" dataKey="Strike rate" />
                <Stat skeleton data={0} dataKey="Fifties" />
                <Stat skeleton data={0} dataKey="Centuries" />
                <Stat skeleton data={0} dataKey="High. Score" />
              </div>
            </div>
            <div className="overflow-hidden rounded-xl">
              <div className="mb-1 bg-primary p-2 text-primary-foreground">
                <h4 className="text-lg font-semibold md:text-xl">Bowling</h4>
              </div>
              <div className="grid grid-cols-3 gap-1">
                <Stat skeleton data={0} dataKey="Overs" />
                <Stat skeleton data={0} dataKey="Runs" />
                <Stat skeleton data={0} dataKey="Wickets" />
                <Stat skeleton data={0} dataKey="Maidens" />
                <Stat skeleton data={0} dataKey="Economy" />
                <Stat skeleton data={0} dataKey="Strike Rate" />
              </div>
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
  data: number | string;
  showStar?: boolean;
  skeleton?: boolean;
}) {
  return (
    <div className="bg-muted p-2">
      <h5 className="font-semibold uppercase text-muted-foreground max-md:text-sm">
        {dataKey}
      </h5>
      {skeleton ? (
        <Skeleton className="h-8 w-20 max-md:h-7" />
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
