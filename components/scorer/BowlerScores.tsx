import { BallEvent, Player } from "@prisma/client";

import { usePlayerById } from "@/apiHooks/player";
import { calcRuns, calcWickets, getIsInvalidBall } from "@/lib/utils";
import { EventType } from "@/types";

interface BowlerScoresProps {
  playerId: Player["id"];
  events: BallEvent[];
}

// interface BowlerStats {
//   bowlerId: string;
//   runs: number;
//   balls: number;
// }

function BowlerScores({ playerId, events }: BowlerScoresProps) {
  // TODO: Skeleton here
  const { player } = usePlayerById(playerId);
  if (!player) return <p>loading...</p>;

  const legalEvents = events.filter(
    (ball) => ball.type !== "-2" && playerId === ball.bowlerId,
  );

  const legalBallTypes = legalEvents.map(({ type }) => type);

  const totalRuns = calcRuns(
    events
      .filter((event) => event.bowlerId === playerId)
      .map(({ type }) => type),
    false,
  );
  const totalBalls = legalEvents.filter((ball) =>
    getIsInvalidBall(ball.type as EventType),
  ).length;

  const totalWickets = calcWickets(legalBallTypes);

  // function getBowlerStats(events: BallEvent[]): BowlerStats[] {
  //   const bowlerStats: { [batsmanId: string]: BowlerStats } = {};

  //   events.forEach((event) => {
  //     const { type, bowlerId } = event;

  //     if (!bowlerStats[bowlerId]) {
  //       bowlerStats[bowlerId] = {
  //         bowlerId,
  //         runs: 0,
  //         balls: 0,
  //       };
  //     }

  //     bowlerStats[bowlerId].runs += Number(type);
  //     bowlerStats[bowlerId].balls++;
  //   });

  //   return Object.values(bowlerStats);
  // }

  return (
    <div className="flex w-full items-center justify-between rounded-md bg-muted p-2 text-lg">
      {player?.name}
      <div className="flex gap-2">
        <p>
          {totalWickets}/{totalRuns} ({Math.floor(totalBalls / 6)}
          {totalBalls % 6 ? `.${totalBalls % 6}` : ""})
        </p>
      </div>
    </div>
  );
}

export default BowlerScores;
