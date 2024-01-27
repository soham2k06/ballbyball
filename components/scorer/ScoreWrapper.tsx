import { Separator } from "../ui/separator";

function ScoreWrapper({
  runs,
  wickets,
  totalBalls,
}: {
  runs: number;
  wickets: number;
  totalBalls: number;
}) {
  return (
    <>
      <h2 className="block text-center font-semibold text-7xl tabular-nums mb-6">
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
        <span>RR: {totalBalls ? ((runs / totalBalls) * 6).toFixed(2) : 0}</span>
      </div>
    </>
  );
}

export default ScoreWrapper;
