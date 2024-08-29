import { calcRuns, generateOverSummary } from "@/lib/utils";

import BallSummary from "../scorer/BallSummary";
import { EventType } from "@/types";

function FullOverSummary({ ballEvents }: { ballEvents: EventType[] }) {
  const { overSummaries } = generateOverSummary(ballEvents);
  return (
    <>
      {overSummaries.length > 0 ? (
        <ul className="h-[calc(100dvh-160px)] divide-y overflow-y-auto p-2">
          {overSummaries.map((over, overI) => {
            const runs = calcRuns(over);
            const wickets = over.filter((ball) => ball.includes("-1")).length;
            return (
              <div
                key={overI}
                className="flex items-center gap-4 py-4 first:pt-0"
              >
                <div className="flex min-w-20 gap-2 whitespace-nowrap text-sm font-bold">
                  <h3>O. {overI + 1}</h3>
                  <span>
                    ({runs}/{wickets})
                  </span>
                </div>
                <ul className="flex h-12 items-center gap-2 overflow-x-auto">
                  {over.map((ball, ballI) => (
                    <BallSummary key={ballI} event={ball} size="sm" />
                  ))}
                </ul>
              </div>
            );
          })}
        </ul>
      ) : (
        <div className="flex h-full min-h-96 flex-col items-center justify-center space-y-2 text-center">
          <h2 className="text-2xl font-bold">There is no data to show!</h2>
          <p>Start adding runs to see data</p>
        </div>
      )}
    </>
  );
}

export default FullOverSummary;
