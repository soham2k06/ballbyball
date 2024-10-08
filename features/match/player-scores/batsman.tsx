import { BallEvent, Player } from "@prisma/client";

import { getBattingStats, getScore } from "@/lib/utils";

interface BatsmanScoresProps {
  players: Player[];
  onStrikeBatsman: number;
  playerIds: Player["id"][];
  events: BallEvent[];
}

function BatsmanScores({
  players,
  playerIds,
  events,
  onStrikeBatsman,
}: BatsmanScoresProps) {
  const player1 = players.find((player) => player.id === playerIds[0]);
  const player2 = players.find((player) => player.id === playerIds[1]);

  return (
    <div className="flex w-full flex-col justify-between gap-1 rounded-md bg-muted p-2 text-lg">
      <div className="flex border-b border-muted-foreground/20 pb-1 text-sm font-bold text-muted-foreground">
        <div className="mr-4 w-full max-w-28 text-left text-[13px] uppercase">
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
        const player = i === 0 ? player1 : player2;
        const isOnStrike = onStrikeBatsman === i;

        const legalEvents = events.filter((ball) => id === ball.batsmanId);

        const { runs: totalRuns, totalBalls } = getScore({
          balls: events
            .filter((evt) => evt.batsmanId === id)
            .map(({ type }) => type),
          forBatsman: true,
        });

        const strikeRate =
          Math.round((totalBalls ? (totalRuns / totalBalls) * 100 : 0) * 10) /
          10;

        const { fours, sixes } = getBattingStats(legalEvents);

        // if (!player)
        //   return <Skeleton key={id} className="h-5 w-full bg-foreground/10" />;

        return (
          <div key={player?.id} className="flex items-center text-sm">
            <div className="mr-4 flex w-full max-w-28 text-[13px] font-bold">
              <p className="max-w-28 truncate">{player?.name}</p>
              {isOnStrike && "*"}
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
                {strikeRate}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BatsmanScores;
