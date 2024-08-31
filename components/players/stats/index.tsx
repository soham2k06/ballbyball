import { usePlayerStats } from "@/apiHooks/player";
import { getOverStr, round } from "@/lib/utils";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import MoreBatting from "./MoreBatting";
import MoreBowling from "./MoreBowling";

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
  const { data, isLoading } = usePlayerStats(playerId);
  const matchesPlayed = data?.matchesPlayed;

  const batStrikeRate =
    Math.round(
      ((data?.batting.runs ?? 0) / (data?.batting.balls ?? 1)) * 10000,
    ) / 100;

  const outTimes = data?.batting.wickets;
  const batAverage = (data?.batting.runs ?? 0) / (outTimes ?? 0) ?? 0;

  const bestSpell = data?.bowling.bestSpell;

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
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl">
            <div className="mb-1 flex h-12 items-center justify-between bg-primary p-2 text-primary-foreground">
              <h4 className="text-lg font-semibold md:text-xl">Batting</h4>
              {data && <MoreBatting data={data} />}
            </div>
            <div className="grid grid-cols-3 gap-1">
              <Stat
                isLoading={isLoading}
                data={data?.batting.runs}
                dataKey="Runs"
              />
              <Stat
                isLoading={isLoading}
                data={matchesPlayed && batAverage ? round(batAverage) : "-"}
                dataKey="Average"
              />
              <Stat
                isLoading={isLoading}
                data={data?.batting.balls ? batStrikeRate : "-"}
                dataKey="Strike rate"
              />
              <Stat
                isLoading={isLoading}
                data={data?.batting.fifties}
                dataKey="Fifties"
              />
              <Stat
                isLoading={isLoading}
                data={data?.batting.centuries}
                dataKey="Centuries"
              />
              <Stat
                isLoading={isLoading}
                data={`${data?.batting.highestScore}${data?.batting.isNotoutOnHighestScore ? "*" : ""}`}
                dataKey="Best"
              />
            </div>
          </div>
          <div className="overflow-hidden rounded-xl">
            <div className="mb-1 flex h-12 items-center justify-between bg-primary p-2 text-primary-foreground">
              <h4 className="text-lg font-semibold md:text-xl">Bowling</h4>
              {data && <MoreBowling data={data} />}
            </div>
            <div className="grid grid-cols-3 gap-1">
              <Stat
                isLoading={isLoading}
                data={getOverStr(data?.bowling.balls ?? 0)}
                dataKey="Overs"
              />
              <Stat
                isLoading={isLoading}
                data={data?.bowling.runs}
                dataKey="Runs"
              />
              <Stat
                isLoading={isLoading}
                data={data?.bowling.wickets}
                dataKey="Wickets"
              />
              <Stat
                isLoading={isLoading}
                data={data?.bowling.maidenOvers}
                dataKey="Maidens"
              />
              <Stat
                isLoading={isLoading}
                data={
                  data?.bowling.economy ? round(data?.bowling.economy) : "-"
                }
                dataKey="Economy"
              />
              <Stat
                isLoading={isLoading}
                data={
                  bestSpell
                    ? `${bestSpell.wickets}/${bestSpell.runs} (${getOverStr(bestSpell.balls)})`
                    : "-"
                }
                dataKey="Best"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function Stat({
  data,
  dataKey,
  showStar,
  isLoading,
}: {
  dataKey: string;
  data: number | string | undefined;
  showStar?: boolean;
  isLoading?: boolean;
}) {
  return (
    <div className="bg-muted p-2">
      <h5 className="font-semibold uppercase text-muted-foreground max-md:text-sm">
        {dataKey}
      </h5>
      {isLoading ? (
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