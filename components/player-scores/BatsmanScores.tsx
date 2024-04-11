import { BallEvent, Player } from "@prisma/client";

import { usePlayerById } from "@/apiHooks/player";
import { calcRuns, getBattingStats, getIsInvalidBall } from "@/lib/utils";
import { EventType } from "@/types";

interface BatsmanScoresProps {
  onStrikeBatsman: number;
  playerIds: Player["id"][];
  events: BallEvent[];
}

function BatsmanScores({
  playerIds,
  events,
  onStrikeBatsman,
}: BatsmanScoresProps) {
  if (!playerIds) return "Loading...";
  const player1 = usePlayerById(playerIds[0]);
  const player2 = usePlayerById(playerIds[1]);

  return (
    <div className="flex w-full flex-col justify-between gap-1 rounded-md bg-muted p-2 text-lg">
      <div className="flex border-b border-muted-foreground/20 pb-1 text-sm font-bold text-muted-foreground">
        <div className="mr-4 w-full max-w-28 text-[13px] uppercase">
          batting
        </div>
        <div className="grid w-full grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2 text-xs">
          <div className="text-center">R</div>
          <div className="text-center">B</div>
          <div className="text-center">4s</div>
          <div className="text-center">6s</div>
          <div className="min-w-8 text-center">SR</div>
        </div>
      </div>
      {playerIds.map((id, i) => {
        const player = i === 0 ? player1.player : player2.player;
        const isOnStrike = onStrikeBatsman === i;

        const legalEvents = events.filter(
          (ball) => ball.type !== "-2" && id === ball.batsmanId,
        );

        const totalRuns = calcRuns(
          legalEvents.map(({ type }) => type),
          true,
        );
        const totalBalls = legalEvents.filter((ball) =>
          getIsInvalidBall(ball.type as EventType),
        ).length;

        const strikeRate =
          Math.round((totalBalls ? (totalRuns / totalBalls) * 100 : 0) * 10) /
          10;

        const { fours, sixes } = getBattingStats(legalEvents);

        if (!player) return;

        return (
          <div key={player.id} className="flex items-center text-sm">
            <div className="mr-4 w-full max-w-28 truncate text-[13px] font-bold">
              {player.name}
              {isOnStrike && " **"}
            </div>
            <div className="grid w-full grid-cols-[1fr_1fr_1fr_1fr_auto] gap-2">
              <div className="text-center text-xs tabular-nums">
                {totalRuns}
              </div>
              <div className="text-center text-xs tabular-nums">
                {totalBalls}
              </div>
              <div className="text-center text-xs tabular-nums">{fours}</div>
              <div className="text-center text-xs tabular-nums">{sixes}</div>
              <div className="min-w-8 text-center text-xs tabular-nums">
                {222.2 || strikeRate}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BatsmanScores;
