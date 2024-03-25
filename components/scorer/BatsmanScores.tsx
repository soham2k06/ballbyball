import { BallEvent, Player } from "@prisma/client";

import { usePlayerById } from "@/apiHooks/player";
import { calcRuns, getBattingStats, getIsInvalidBall } from "@/lib/utils";
import { EventType } from "@/types";

interface BatsmanScoresProps {
  onStrikeBatsman: number;
  playerIds: Player["id"][];
  events: BallEvent[];
}

// interface BatsmanStats {
//   batsmanId: string;
//   events: EventType[];
//   outBy?: string;
// }

function BatsmanScores({
  playerIds,
  events,
  onStrikeBatsman,
}: BatsmanScoresProps) {
  if (!playerIds) return "Loading...";
  const player1 = usePlayerById(playerIds[0]);
  const player2 = usePlayerById(playerIds[1]);

  // function getBatsmanStats(events: BallEvent[]): BatsmanStats[] {
  //   const batsmanStats: { [batsmanId: string]: BatsmanStats } = {};

  //   events.forEach((event) => {
  //     const { batsmanId, type, bowlerId } = event;

  //     if (!batsmanStats[batsmanId]) {
  //       batsmanStats[batsmanId] = {
  //         batsmanId: batsmanId,
  //         events: [],
  //       };
  //     }

  // batsmanStats[batsmanId].events.push(type as EventType);

  //     if (type === "-1") {
  //       batsmanStats[batsmanId].outBy = bowlerId;
  //     }
  //   });

  //   return Object.values(batsmanStats);
  // }

  // const batsmanStats = getBatsmanStats(events);

  return (
    <div className="flex w-full flex-col items-center justify-between rounded-md bg-muted p-2 text-lg">
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

        const { fours, sixes } = getBattingStats(legalEvents);

        if (!player) return;

        return (
          <div key={player.id}>
            {player.name}
            {isOnStrike && " **"}
            <div className="flex gap-2">
              <div>Runs: {totalRuns}</div>
              <div>Balls: {totalBalls}</div>
              <div>4s: {fours}</div>
              <div>6s: {sixes}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BatsmanScores;
