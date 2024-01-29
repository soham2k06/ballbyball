import { Separator } from "../ui/separator";

function ScoreWrapper({
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
      <h2 className="block text-center font-semibold text-8xl tabular-nums my-6">
        {runs}/{wickets}
      </h2>
      <div className="opacity-50 flex items-center justify-center text-center text-xl">
        <span>
          ({Math.floor(totalBalls / 6)}
          {totalBalls % 6 ? `.${totalBalls % 6}` : ""})
        </span>
        <Separator
          orientation="vertical"
          className="bg-muted-foreground h-6 mx-2"
        />
        <span>RR: {runRate}</span>
      </div>
    </>
  );
}

export default ScoreWrapper;
