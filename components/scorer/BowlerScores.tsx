import { usePlayerById } from "@/hooks/api/player/usePlayerById";
import { calcRuns, calcWickets } from "@/lib/utils";
import { BallEvent, Player } from "@prisma/client";

interface BowlerScoresProps {
  playerId: Player["id"];
  events: BallEvent[];
}

function BowlerScores({ playerId, events }: BowlerScoresProps) {
  // TODO: Skeleton here
  const { player } = usePlayerById(playerId);
  if (!player) return <p>loading...</p>;

  const legalEvents = events.filter(
    (ball) => ball.type !== "-2" && playerId === ball.bowlerId,
  );

  const legalBallTypes = legalEvents.map(({ type }) => type);

  const totalRuns = calcRuns(
    events.map(({ type }) => type),
    false,
    true,
  );
  const totalBalls = legalEvents.filter(
    (ball) => !["-3", "-2"].includes(ball.type) && !ball.type.includes("-3"),
  ).length;

  const totalWickets = calcWickets(legalBallTypes);

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
