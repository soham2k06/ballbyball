import { BallEvent, Player } from "@prisma/client";

import { getOverStr, getScore } from "@/lib/utils";

interface BowlerScoresProps {
  player: Player | undefined;
  events: BallEvent[];
}

function BowlerScores({ player, events }: BowlerScoresProps) {
  const { runs, totalBalls, runRate, wickets } = getScore(
    events
      .filter((event) => event.bowlerId === player?.id)
      .map(({ type }) => type),
  );

  return (
    <div className="flex w-full flex-col gap-1 rounded-md bg-muted p-2 text-lg">
      <div className="flex border-b border-muted-foreground/20 pb-1 text-sm font-bold text-muted-foreground">
        <div className="mr-4 w-full max-w-28 text-left text-[13px] uppercase">
          bowling
        </div>
        <div className="grid w-full grid-cols-[1fr_1fr_1fr_auto] gap-2 text-xs">
          <div className="text-center">O</div>
          <div className="text-center">W</div>
          <div className="text-center">R</div>
          <div className="min-w-14 text-center">ECON</div>
        </div>
      </div>

      <div className="flex items-center text-sm">
        <div className="mr-4 w-full max-w-28 truncate text-[13px] font-bold">
          {player?.name}
        </div>
        <div className="grid w-full grid-cols-[1fr_1fr_1fr_auto] gap-2">
          <div className="text-center text-xs tabular-nums">
            {getOverStr(totalBalls)}
          </div>
          <div className="text-center text-xs tabular-nums">{wickets}</div>
          <div className="text-center text-xs tabular-nums">{runs}</div>
          <div className="min-w-14 text-center text-xs tabular-nums">
            {runRate}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BowlerScores;
