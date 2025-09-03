import { BallEvent } from "@prisma/client";

import { wicketTypes } from "@/lib/constants";
import { calcRuns, getOverStr, getScore, round } from "@/lib/utils";
import { CreateBallEventSchema } from "@/lib/validation/ball-event";
import { EventType, PlayerSimplified } from "@/types";

import BallSummary from "../scorer/ball-summary";

import { getFullOverSummary, getNormalOverSummary } from "./utils";

type Event = BallEvent | CreateBallEventSchema;

function FullOverSummary({
  ballEvents,
  showDetails,
  players,
}: {
  ballEvents: Event[];
  showDetails: boolean;
  players?: PlayerSimplified[];
}) {
  const { overSummaries: normalSummaries } = getNormalOverSummary(
    ballEvents,
    players,
  );

  const fullOverSummary = showDetails
    ? getFullOverSummary(ballEvents, players)
    : [];

  return (
    <>
      {ballEvents.length > 0 ? (
        <ul className="h-[calc(100dvh-160px)] divide-y overflow-y-auto p-2">
          {showDetails
            ? fullOverSummary.map((summary, summaryIndex) => {
                const { runs, wickets } = getScore({
                  balls: summary.balls.map((b) => b.type),
                });
                return (
                  <div
                    key={summaryIndex}
                    className="mx-auto flex max-w-7xl flex-col gap-4 py-4 first:pt-0"
                  >
                    <div className="space-y-2 rounded-md bg-muted p-2">
                      <div className="flex justify-between">
                        <div className="flex flex-col gap-0.5 text-sm font-semibold">
                          <h3>End of over {summaryIndex + 1}</h3>
                          <p className="text-xs">
                            {runs}/{wickets}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-0.5 text-sm font-semibold">
                          <p>
                            {summary.teamScore.runs}/{summary.teamScore.wickets}
                          </p>
                          <p className="text-xs">
                            RR:{" "}
                            {round(summary.teamScore.runs / (summaryIndex + 1))}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <ul className="flex flex-col gap-1 text-xs leading-none">
                          {summary.batsmen.map((batsman, batsmanI) => (
                            <li key={batsmanI} className="flex gap-2">
                              <p>{batsman.name}</p>
                              <p>
                                {batsman.runs} ({batsman.balls})
                              </p>
                            </li>
                          ))}
                        </ul>
                        <ul className="flex flex-col gap-1 text-xs leading-none">
                          {summary.bowler.map((b, bI) => (
                            <li key={bI} className="flex gap-2">
                              <p>{b.name}</p>
                              <p>
                                {b.runs}/{b.wickets} ({getOverStr(b.balls)})
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <ul className="flex flex-col gap-4">
                      {summary.balls.map((ball, ballI) => {
                        return (
                          <li
                            className="flex items-center gap-4 sm:gap-8"
                            key={ballI}
                          >
                            <BallSummary
                              event={ball.type as EventType}
                              radius="sm"
                            />
                            <p className="max-sm:text-sm">
                              {ball.overStr}: {ball.batsman}
                              {ball.type.includes("-1")
                                ? ` - ${
                                    wicketTypes.find(
                                      (w) =>
                                        w.id ===
                                        parseInt(ball.type.split("_")[1]),
                                    )?.type
                                  }${ball.fielder ? ` by ${ball.fielder}` : ""}`
                                : ball.type.includes("W")}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })
            : normalSummaries.map(
                ({ over, teamScore, batsmen, bowler }, summaryIndex) => {
                  const runs = calcRuns(over.map((b) => b.type));
                  const wickets = over.filter((ball) =>
                    ball.type.includes("-1"),
                  ).length;
                  return (
                    <div
                      key={summaryIndex}
                      className="mx-auto flex max-w-7xl flex-col gap-2 py-4 first:pt-0"
                    >
                      <div className="space-y-2 rounded-md bg-muted p-2">
                        <div className="flex justify-between">
                          <div className="flex flex-col gap-0.5 text-sm font-semibold">
                            <h3>End of over {summaryIndex + 1}</h3>
                            <p className="text-xs">
                              {runs}/{wickets}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-0.5 text-sm font-semibold">
                            <p>
                              {teamScore.runs}/{teamScore.wickets}
                            </p>
                            <p className="text-xs">
                              RR: {round(teamScore.runs / (summaryIndex + 1))}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <ul className="flex flex-col gap-1 text-xs leading-none">
                            {batsmen.map((batsman, batsmanI) => (
                              <li key={batsmanI} className="flex gap-2">
                                <p>{batsman.name}</p>
                                <p>
                                  {batsman.runs} ({batsman.balls})
                                </p>
                              </li>
                            ))}
                          </ul>
                          <ul className="flex flex-col gap-1 text-xs leading-none">
                            {bowler.map((b, bI) => (
                              <li key={bI} className="flex gap-2">
                                <p>{b.name}</p>
                                <p>
                                  {b.runs}/{b.wickets} ({getOverStr(b.balls)})
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <ul className="flex items-center gap-2 overflow-x-auto">
                        {over.map((ball, ballI) => (
                          <BallSummary
                            key={ballI}
                            event={ball.type as EventType}
                            size="sm"
                          />
                        ))}
                      </ul>
                    </div>
                  );
                },
              )}
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
