import { BallEvent, Player } from "@prisma/client";

import { usePlayerById } from "@/apiHooks/player";
import { getOverStr, getScore } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

interface BowlerScoresProps {
  playerId: Player["id"];
  events: BallEvent[];
}

function BowlerScores({ playerId, events }: BowlerScoresProps) {
  // TODO: Skeleton here
  const { player } = usePlayerById(playerId);

  const { runs, totalBalls, runRate, wickets } = getScore(
    events
      .filter((event) => event.bowlerId === playerId)
      .map(({ type }) => type),
  );

  return (
    <table className="flex w-full flex-col gap-1 rounded-md bg-muted p-2 text-lg">
      <tr className="flex border-b border-muted-foreground/20 pb-1 text-sm font-bold text-muted-foreground">
        <th className="mr-4 w-full max-w-28 text-left text-[13px] uppercase">
          bowling
        </th>
        <div className="grid w-full grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs">
          <th className="text-center">O</th>
          <th className="text-center">W</th>
          <th className="text-center">R</th>
          <th className="min-w-14 text-center">ECON</th>
        </div>
      </tr>

      {player ? (
        <tr className="flex items-center text-sm">
          <td className="mr-4 w-full max-w-28 truncate text-[13px] font-bold">
            {player.name}
          </td>
          <div className="grid w-full grid-cols-[1fr_1fr_1fr_auto] gap-2">
            <td className="text-center text-xs tabular-nums">
              {getOverStr(totalBalls)}
            </td>
            <td className="text-center text-xs tabular-nums">{wickets}</td>
            <td className="text-center text-xs tabular-nums">{runs}</td>
            <td className="min-w-14 text-center text-xs tabular-nums">
              {runRate}
            </td>
          </div>
        </tr>
      ) : (
        <Skeleton className="h-[22px] w-full bg-foreground/10" />
      )}
    </table>
  );
}

export default BowlerScores;
