import { Separator } from "../ui/separator";

function ScoreDisplay({
  runs,
  wickets,
  totalBalls,
  runRate,
}: {
  runs: number;
  wickets: number;
  totalBalls: number;
  runRate: number;
}) {
  return (
    <>
      <h2 className="my-6 block text-center text-8xl font-semibold tabular-nums">
        {runs}/{wickets}
      </h2>
      <div className="flex items-center justify-center text-center text-xl opacity-50">
        <span>
          ({Math.floor(totalBalls / 6)}
          {totalBalls % 6 ? `.${totalBalls % 6}` : ""})
        </span>
        <Separator
          orientation="vertical"
          className="mx-2 h-6 bg-muted-foreground"
        />
        <span>RR: {runRate}</span>
      </div>
    </>
  );
}

export default ScoreDisplay;
