import { BallEvent } from "@prisma/client";

import {
  calcRuns,
  getIsvalidBall,
  getOverStr,
  getScore,
  round,
} from "@/lib/utils";
import { CreateBallEventSchema } from "@/lib/validation/ball-event";
import { EventType, PlayerSimplified } from "@/types";

import BallSummary from "../scorer/ball-summary";

type Event = BallEvent | CreateBallEventSchema;

type BallInfo = {
  type: string;
  batsman: string | undefined;
  bowler: string | undefined;
  fielder: string | undefined;
  overStr: string;
};

function FullOverSummary({
  ballEvents,
  showNames,
  players,
}: {
  ballEvents: Event[];
  showNames: boolean;
  players?: PlayerSimplified[];
}) {
  function generateOverSummary(ballEvents: Event[]) {
    let ballLimitInOver = 6;
    const overSummaries: {
      teamScore: { runs: number; wickets: number };
      over: Event[];
      batsmen: {
        name: string | undefined;
        runs: number;
        balls: number;
      }[];
      bowler: {
        name: string | undefined;
        runs: number;
        balls: number;
        wickets: number;
      }[];
    }[] = [];

    let validBallCount = 0;
    let currentOver: Event[] = [];
    let accumulatedBatsmanEvents: { [key: string]: Event[] } = {};
    let accumulatedBowlerEvents: { [key: string]: Event[] } = {};
    let batsmanOut: { [key: string]: boolean } = {};

    let totalRuns = 0;
    let totalWickets = 0;

    for (const ballEvent of ballEvents) {
      const isInvalidBall = getIsvalidBall(ballEvent.type);

      currentOver.push(ballEvent);

      totalRuns += calcRuns([ballEvent.type]);
      if (ballEvent.type.includes("-1")) totalWickets++;

      if (ballEvent.batsmanId && !batsmanOut[ballEvent.batsmanId]) {
        if (!accumulatedBatsmanEvents[ballEvent.batsmanId]) {
          accumulatedBatsmanEvents[ballEvent.batsmanId] = [];
        }
        accumulatedBatsmanEvents[ballEvent.batsmanId].push(ballEvent);
      }

      if (ballEvent.type.includes("-1")) {
        batsmanOut[ballEvent.batsmanId] = true;
      }

      if (ballEvent.bowlerId) {
        if (!accumulatedBowlerEvents[ballEvent.bowlerId]) {
          accumulatedBowlerEvents[ballEvent.bowlerId] = [];
        }
        accumulatedBowlerEvents[ballEvent.bowlerId].push(ballEvent);
      }

      if (isInvalidBall) {
        validBallCount++;
        if (validBallCount === 6) {
          const currentBowlerId = currentOver[0].bowlerId;

          const currentBatsmanEvents: { id: string; events: Event[] }[] = [];
          for (const batsmanId in accumulatedBatsmanEvents) {
            if (
              accumulatedBatsmanEvents.hasOwnProperty(batsmanId) &&
              !batsmanOut[batsmanId]
            ) {
              currentBatsmanEvents.push({
                id: batsmanId,
                events: [...accumulatedBatsmanEvents[batsmanId]],
              });
            }
          }

          const currentBowlerEvents: { id: string; events: Event[] }[] = [];
          if (accumulatedBowlerEvents[currentBowlerId]) {
            currentBowlerEvents.push({
              id: currentBowlerId,
              events: [...accumulatedBowlerEvents[currentBowlerId]],
            });
          }

          overSummaries.push({
            over: [...currentOver],
            teamScore: {
              runs: totalRuns,
              wickets: totalWickets,
            },
            batsmen: currentBatsmanEvents.map((b) => {
              const score = getScore({
                balls: b.events.map((e) => e.type),
                forBatsman: true,
              });

              return {
                name: players?.find((p) => p.id === b.id)?.name,
                runs: score.runs,
                balls: score.totalBalls,
                wickets: score.wickets,
              };
            }),
            bowler: currentBowlerEvents.map((b) => {
              const score = getScore({
                balls: b.events.map((e) => e.type),
                forBowler: true,
              });

              return {
                name: players?.find((p) => p.id === b.id)?.name,
                runs: score.runs,
                balls: score.totalBalls,
                wickets: score.wickets,
              };
            }),
          });

          currentOver = [];
          validBallCount = 0;
          ballLimitInOver = 6;
        }
      } else if (ballLimitInOver !== undefined) ballLimitInOver++;
    }

    if (validBallCount >= 0 && currentOver.length > 0) {
      const currentBowlerId = currentOver[0].bowlerId;

      const finalBatsmanEvents: { id: string; events: Event[] }[] = [];
      for (const batsmanId in accumulatedBatsmanEvents) {
        if (
          accumulatedBatsmanEvents.hasOwnProperty(batsmanId) &&
          !batsmanOut[batsmanId]
        ) {
          finalBatsmanEvents.push({
            id: batsmanId,
            events: [...accumulatedBatsmanEvents[batsmanId]],
          });
        }
      }

      const finalBowlerEvents: { id: string; events: Event[] }[] = [];
      if (accumulatedBowlerEvents[currentBowlerId]) {
        finalBowlerEvents.push({
          id: currentBowlerId,
          events: [...accumulatedBowlerEvents[currentBowlerId]],
        });
      }

      overSummaries.push({
        over: [...currentOver],
        teamScore: {
          runs: totalRuns,
          wickets: totalWickets,
        },
        batsmen: finalBatsmanEvents.map((b) => {
          const score = getScore({
            balls: b.events.map((e) => e.type),
            forBatsman: true,
          });
          return {
            name: players?.find((p) => p.id === b.id)?.name,
            runs: score.runs,
            balls: score.totalBalls,
          };
        }),
        bowler: finalBowlerEvents.map((b) => {
          const score = getScore({
            balls: b.events.map((e) => e.type),
            forBowler: true,
          });

          return {
            name: players?.find((p) => p.id === b.id)?.name,
            runs: score.runs,
            balls: score.totalBalls,
            wickets: score.wickets,
          };
        }),
      });
    }

    return { overSummaries, ballLimitInOver };
  }

  const { overSummaries: normalSummaries } = generateOverSummary(ballEvents);

  function getFullOverSummary(ballEvents: Event[]) {
    let ballLimitInOver = 6;
    const overSummaries: BallInfo[][] = [];
    let validBallCount = 0;
    let currentOver: BallInfo[] = [];

    for (const ballEvent of ballEvents) {
      const isInvalidBall = getIsvalidBall(ballEvent.type);
      const batsman = players?.find((p) => p.id === ballEvent.batsmanId);
      const bowler = players?.find((p) => p.id === ballEvent.bowlerId);

      const wicketsWithFielder = ["_3", "_5", "_6"];
      const fielder = ballEvent.type.includes("-1")
        ? ballEvent.type === "-1_4"
          ? bowler
          : wicketsWithFielder.some((w) => ballEvent.type.includes(w))
            ? players?.find((p) => p.id === ballEvent.type.split("_")[2])
            : undefined
        : undefined;

      currentOver.push({
        type: ballEvent.type,
        batsman: batsman?.name,
        bowler: bowler?.name,
        fielder: fielder?.name,
        overStr: getOverStr(
          validBallCount + overSummaries.length * 6 + 1,
          true,
        ),
      });
      if (isInvalidBall) {
        validBallCount++;
        if (validBallCount === 6) {
          overSummaries.push(currentOver);
          currentOver = [];
          validBallCount = 0;
          ballLimitInOver = 6;
        }
      } else if (ballLimitInOver !== undefined) ballLimitInOver++;
    }

    if (validBallCount >= 0 && currentOver.length > 0) {
      overSummaries.push(currentOver);
    }

    return overSummaries;
  }

  const fullOverSummary = showNames ? getFullOverSummary(ballEvents) : [];

  return (
    <>
      {ballEvents.length > 0 ? (
        <ul className="h-[calc(100dvh-160px)] divide-y overflow-y-auto p-2">
          {showNames
            ? fullOverSummary.map((over, overI) => {
                const { runs, wickets } = getScore({
                  balls: over.map((b) => b.type),
                });
                return (
                  <div
                    key={overI}
                    className="mx-auto flex max-w-7xl flex-col gap-4 py-4"
                  >
                    <div className="flex gap-2 text-sm font-bold">
                      <h3>
                        Over {overI + 1}, {runs}/{wickets}, bowler:{" "}
                        {over[0].bowler}
                      </h3>
                    </div>
                    <ul className="flex flex-col gap-4">
                      {over.map((ball, ballI) => {
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
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })
            : normalSummaries.map(
                ({ over, teamScore, batsmen, bowler }, overI) => {
                  const runs = calcRuns(over.map((b) => b.type));
                  const wickets = over.filter((ball) =>
                    ball.type.includes("-1"),
                  ).length;
                  return (
                    <div
                      key={overI}
                      className="mx-auto flex max-w-7xl flex-col gap-2 py-4 first:pt-0"
                    >
                      <div className="space-y-2 rounded-md bg-muted p-2">
                        <div className="flex justify-between">
                          <div className="flex flex-col gap-0.5 text-sm font-semibold">
                            <h3>End of over {overI + 1}</h3>
                            <p className="text-xs">
                              {runs}/{wickets}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-0.5 text-sm font-semibold">
                            <p>
                              {teamScore.runs}/{teamScore.wickets}
                            </p>
                            <p className="text-xs">
                              RR: {round(teamScore.runs / (overI + 1))}
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
