import { BallEvent } from "@prisma/client";

import { calcRuns, getIsvalidBall, getOverStr, getScore } from "@/lib/utils";
import { CreateBallEventSchema } from "@/lib/validation/ball-event";
import { PlayerSimplified } from "@/types";

type Event = BallEvent | CreateBallEventSchema;

type BallInfo = {
  type: string;
  batsman: string | undefined;
  bowler: string | undefined;
  fielder: string | undefined;
  overStr: string;
};

function getNormalOverSummary(
  ballEvents: Event[],
  players?: PlayerSimplified[],
) {
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

function getFullOverSummary(ballEvents: Event[], players?: PlayerSimplified[]) {
  let ballLimitInOver = 6;
  const overSummaries: {
    balls: (BallInfo & { batsmanId?: string; bowlerId?: string })[];
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
    teamScore: { runs: number; wickets: number };
  }[] = [];

  let validBallCount = 0;
  let currentOver: (BallInfo & { batsmanId?: string; bowlerId?: string })[] =
    [];

  let accumulatedBatsmanEvents: { [key: string]: Event[] } = {};
  let accumulatedBowlerEvents: { [key: string]: Event[] } = {};
  let batsmanOut: { [key: string]: boolean } = {};

  let totalRuns = 0;
  let totalWickets = 0;

  for (const ballEvent of ballEvents) {
    const isInvalidBall = getIsvalidBall(ballEvent.type);
    const batsman = players?.find((p) => p.id === ballEvent.batsmanId);
    const bowler = players?.find((p) => p.id === ballEvent.bowlerId);

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
      batsmanId: ballEvent.batsmanId,
      bowlerId: ballEvent.bowlerId,
      fielder: fielder?.name,
      overStr: getOverStr(validBallCount + overSummaries.length * 6 + 1, true),
    });

    totalRuns += calcRuns([ballEvent.type]);
    if (ballEvent.type.includes("-1")) totalWickets++;

    if (isInvalidBall) {
      validBallCount++;
      if (validBallCount === 6) {
        const batsmenStats = Object.entries(accumulatedBatsmanEvents)
          .filter(([id]) => !batsmanOut[id])
          .map(([id, events]) => {
            const score = getScore({
              balls: events.map((e) => e.type),
              forBatsman: true,
            });
            return {
              name: players?.find((p) => p.id === id)?.name,
              runs: score.runs,
              balls: score.totalBalls,
            };
          });

        const bowlerStats = (() => {
          const bowlerId = currentOver[0].bowlerId;
          if (bowlerId && accumulatedBowlerEvents[bowlerId]) {
            const score = getScore({
              balls: accumulatedBowlerEvents[bowlerId].map((e) => e.type),
              forBowler: true,
            });
            return [
              {
                name: players?.find((p) => p.id === bowlerId)?.name,
                runs: score.runs,
                balls: score.totalBalls,
                wickets: score.wickets,
              },
            ];
          }
          return [];
        })();

        overSummaries.push({
          balls: [...currentOver],
          batsmen: batsmenStats,
          bowler: bowlerStats,
          teamScore: {
            runs: totalRuns,
            wickets: totalWickets,
          },
        });

        currentOver = [];
        validBallCount = 0;
        ballLimitInOver = 6;
      }
    } else if (ballLimitInOver !== undefined) ballLimitInOver++;
  }

  if (validBallCount >= 0 && currentOver.length > 0) {
    const batsmenStats = Object.entries(accumulatedBatsmanEvents)
      .filter(([id]) => !batsmanOut[id])
      .map(([id, events]) => {
        const score = getScore({
          balls: events.map((e) => e.type),
          forBatsman: true,
        });
        return {
          name: players?.find((p) => p.id === id)?.name,
          runs: score.runs,
          balls: score.totalBalls,
        };
      });

    const bowlerStats = (() => {
      const bowlerId = currentOver[0].bowlerId;
      if (bowlerId && accumulatedBowlerEvents[bowlerId]) {
        const score = getScore({
          balls: accumulatedBowlerEvents[bowlerId].map((e) => e.type),
          forBowler: true,
        });
        return [
          {
            name: players?.find((p) => p.id === bowlerId)?.name,
            runs: score.runs,
            balls: score.totalBalls,
            wickets: score.wickets,
          },
        ];
      }
      return [];
    })();

    overSummaries.push({
      balls: [...currentOver],
      batsmen: batsmenStats,
      bowler: bowlerStats,
      teamScore: {
        runs: totalRuns,
        wickets: 0,
      },
    });
  }

  return overSummaries;
}

export { getNormalOverSummary, getFullOverSummary };
