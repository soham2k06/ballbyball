import { BallEvent } from "@prisma/client";

import {
  calcRuns,
  generateOverSummary,
  getCommentByEvent,
  getIsvalidBall,
  getOverStr,
  getScore,
} from "@/lib/utils";
import { CreateBallEventSchema } from "@/lib/validation/ball-event";
import { CommentKey, EventType, PlayerSimplified } from "@/types";

import BallSummary from "../scorer/ball-summary";

type Event = BallEvent | CreateBallEventSchema;

type BallInfo = {
  type: string;
  batsman: string | undefined;
  bowler: string | undefined;
  fielder: string | undefined;
  overStr: string;
  randomIndex: number;
};

function FullOverSummary({
  ballEvents,
  showComments,
  players,
}: {
  ballEvents: Event[];
  showComments: boolean;
  players?: PlayerSimplified[];
}) {
  const { overSummaries: normalSummaries } = generateOverSummary(
    ballEvents.map((b) => b.type as EventType),
  );

  function getFullOverSummary(ballEvents: Event[]) {
    let ballLimitInOver = 6;
    const overSummaries: BallInfo[][] = [];
    let validBallCount = 0;
    let currentOver: BallInfo[] = [];

    function getRandomNumberFromString(str: string) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }

      return Math.abs(hash) % 5;
    }

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
        randomIndex: getRandomNumberFromString(
          (ballEvent as BallEvent).id || validBallCount.toString(),
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

  const fullOverSummary = showComments ? getFullOverSummary(ballEvents) : [];

  return (
    <>
      {ballEvents.length > 0 ? (
        <ul className="h-[calc(100dvh-160px)] divide-y overflow-y-auto p-2">
          {showComments
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
                        Over {overI + 1}, {runs}/{wickets}
                      </h3>
                    </div>
                    <ul className="flex flex-col gap-4">
                      {over.map((ball, ballI) => {
                        const comment = getCommentByEvent({
                          batsman: ball.batsman ?? "batsman",
                          bowler: ball.bowler ?? "bowler",
                          fielder: ball.fielder,
                          event: ball.type as CommentKey,
                          randomIndex: ball.randomIndex,
                        });
                        return (
                          <li
                            className="flex gap-4 sm:gap-8 md:items-center"
                            key={ballI}
                          >
                            <BallSummary
                              event={ball.type as EventType}
                              radius="sm"
                            />
                            <p className="max-sm:text-sm">
                              {ball.overStr}: {ball.bowler} to {ball.batsman},{" "}
                              {comment}
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })
            : normalSummaries.map((over, overI) => {
                const runs = calcRuns(over);
                const wickets = over.filter((ball) =>
                  ball.includes("-1"),
                ).length;
                return (
                  <div
                    key={overI}
                    className="mx-auto flex max-w-7xl items-center gap-4 py-4 first:pt-0"
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
