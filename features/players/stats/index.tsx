import { usePlayerStats } from "@/api-hooks/use-player-stats";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { getOverStr, round } from "@/lib/utils";
import type { PlayerStats } from "@/types";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Skeleton } from "@/components/ui/skeleton";

import MoreBatting from "./more-batting";
import MoreBowling from "./more-bowling";
import { Stat } from "./stat";

function Content({
  data,
  isLoading,
}: {
  data: PlayerStats | undefined;
  isLoading: boolean;
}) {
  const matchesPlayed = data?.matchesPlayed;

  const batStrikeRate =
    Math.round(
      ((data?.batting.runs ?? 0) / (data?.batting.balls ?? 1)) * 10000,
    ) / 100;

  const outTimes = data?.batting.wickets;
  const batAverage = (data?.batting.runs ?? 0) / (outTimes ?? 0);

  const bestSpell = data?.bowling.bestSpell;

  return (
    <div className="space-y-1 sm:space-y-4">
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
            data={
              data
                ? `${data?.batting.highestScore}${data?.batting.isNotoutOnHighestScore ? "*" : ""}`
                : "-"
            }
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
            data={data?.bowling.economy ? round(data?.bowling.economy) : "-"}
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
          <Stat
            isLoading={isLoading}
            data={data?.bowling.maidens}
            dataKey="Maidens"
          />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl">
        <div className="mb-1 flex h-12 items-center bg-primary p-2 text-primary-foreground">
          <h4 className="text-lg font-semibold md:text-xl">Fielding</h4>
        </div>
        <div className="grid grid-cols-3 gap-1">
          <Stat
            isLoading={isLoading}
            data={data?.fielding.catches ?? 0}
            dataKey="Catches"
          />
          <Stat
            isLoading={isLoading}
            data={data?.fielding.runOuts ?? 0}
            dataKey="Runouts"
          />
          <Stat
            isLoading={isLoading}
            data={data?.fielding.stumpings ?? 0}
            dataKey="Stumpings"
          />
        </div>
      </div>
    </div>
  );
}

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
  // eslint-disable-next-line no-unused-vars
  setOpenedPlayer: (playerId: string | undefined) => void;
}) {
  const isMobile = useMediaQuery("(max-width: 640px)");

  const playerId = openedPlayer?.id;
  const playerName = openedPlayer?.name;
  const { data, isLoading } = usePlayerStats(playerId);
  const matchesPlayed = data?.matchesPlayed;

  if (isMobile)
    return (
      <Drawer
        open={!!playerId}
        onOpenChange={() => setOpenedPlayer(playerId ? undefined : playerId)}
      >
        <DrawerContent className="p-2 pt-0">
          <DrawerHeader>
            <DrawerTitle>{playerName}</DrawerTitle>

            {isLoading ? (
              <Skeleton className="h-5 w-20 max-sm:mx-auto" />
            ) : (
              <DrawerDescription>{matchesPlayed} Matches</DrawerDescription>
            )}
          </DrawerHeader>
          <Content data={data} isLoading={isLoading} />
        </DrawerContent>
      </Drawer>
    );

  return (
    <Dialog
      open={!!playerId}
      onOpenChange={() => setOpenedPlayer(playerId ? undefined : playerId)}
    >
      <DialogContent className="p-2 pt-0">
        <DialogHeader>
          <DialogTitle>{playerName}</DialogTitle>

          {isLoading ? (
            <Skeleton className="h-5 w-20 max-sm:mx-auto" />
          ) : (
            <DialogDescription>{matchesPlayed} Matches</DialogDescription>
          )}
        </DialogHeader>
        <Content data={data} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
}

export default PlayerStats;
