import { usePlayerById } from "@/hooks/api/player/usePlayerById";
import { calcRuns } from "@/lib/utils";
import { BallEvent, Player } from "@prisma/client";

interface BatsmanScoresProps {
  playerId: Player["id"];
  events: BallEvent[];
}

function BatsmanScores({ playerId, events }: BatsmanScoresProps) {
  // TODO: Skeleton here
  const { player } = usePlayerById(playerId);

  const legalEvents = events.filter(
    (ball) => ball.type !== "-2" && playerId === ball.batsmanId,
  );

  const totalRuns = calcRuns(
    legalEvents.map(({ type }) => type),
    true,
  );
  const totalBalls = legalEvents.filter(
    (ball) => !["-3", "-2"].includes(ball.type) && !ball.type.includes("-3"),
  ).length;

  const scoreByState = legalEvents?.reduce(
    (acc: any, ballEvent: BallEvent) => {
      if (ballEvent.type === "4") acc.fours++;
      else if (ballEvent.type === "6") acc.sixes++;

      return acc;
    },
    { fours: 0, sixes: 0 },
  );

  return (
    <div className="flex w-full items-center justify-between rounded-md bg-muted p-2 text-lg">
      {player?.name}
      <div className="flex gap-2">
        <div>Runs: {totalRuns}</div>
        <div>Balls: {totalBalls}</div>
        <div>4s: {scoreByState?.fours}</div>
        <div>6s: {scoreByState?.sixes}</div>
      </div>
    </div>
  );
}

export default BatsmanScores;
