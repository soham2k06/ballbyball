import { BallEvent, Player } from "@prisma/client";

import { usePlayerById } from "@/apiHooks/player";
import { getOverStr, getScore } from "@/lib/utils";

interface BowlerScoresProps {
  playerId: Player["id"];
  events: BallEvent[];
}

function BowlerScores({ playerId, events }: BowlerScoresProps) {
  // TODO: Skeleton here
  const { player } = usePlayerById(playerId);
  if (!player) return <p>loading...</p>;

  const { runs, totalBalls, runRate, wickets } = getScore(
    events
      .filter((event) => event.bowlerId === playerId)
      .map(({ type }) => type),
  );

  return (
    <table className="flex w-full flex-col gap-1 rounded-md bg-muted p-2 text-lg">
      <tr className="flex border-b border-muted-foreground/20 pb-1 text-sm font-bold text-muted-foreground">
        <td className="mr-4 w-full max-w-28 text-[13px] uppercase">bowling</td>
        <div className="grid w-full grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs">
          <td className="text-center">O</td>
          <td className="text-center">W</td>
          <td className="text-center">R</td>
          <td className="min-w-14 text-center">ECON</td>
        </div>
      </tr>

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
    </table>
  );
}

export default BowlerScores;
