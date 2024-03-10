"use client";

import { EventType } from "@/types";
import { calcRuns, calcWickets, cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import DangerActions from "./DangerActions";
import ScoreWrapper from "./ScoreWrapper";
import BallSummary from "./BallSummary";
import ScoreButtons from "./ScoreButtons";
import FooterSummary from "./FooterSummary";
import { BallEvent } from "@prisma/client";
import { useEventsById } from "@/hooks/api/ballEvent/useEventsById";
import { useCreateBallEvent } from "@/hooks/api/ballEvent/useCreateBallEvent";
import { Loader } from "lucide-react";
import { useUndoBallEvent } from "@/hooks/api/ballEvent/useUndoBallEvent";
import { useDeleteAllBallEvents } from "@/hooks/api/ballEvent/useDeleteAllBallEvents";

export const ballEvents: Record<BallEvent["type"], string> = {
  "-3": "NB",
  "-2": "WD",
  "-1": "W",
  "0": "0",
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "6": "6",
};

function ScorerLayout({ matchId }: { matchId: string }) {
  const { events, isFetching } = useEventsById("65ec91c16bf73a7fd38346cd");

  const balls = events?.map((event) => event.type as EventType);

  const { createBallEvent, isPending } = useCreateBallEvent();
  const { undoBallEvent } = useUndoBallEvent();
  const { deleteAllBallEvents } = useDeleteAllBallEvents();

  if (!balls) return <p>loading...</p>;

  const invalidBalls = ["-3", "-2"];

  const runs = calcRuns(balls);
  const wickets = calcWickets(balls);
  const totalBalls = balls.filter(
    (ball) => !invalidBalls.includes(ball) && !ball.includes("-3"),
  ).length;

  const runRate = Number(totalBalls ? ((runs / totalBalls) * 6).toFixed(2) : 0);

  const extras = balls.filter(
    (ball) => ball === "-2" || ball.includes("-3"),
  ).length;

  let ballLimitInOver = 6;
  function generateOverSummary(ballEvents: EventType[]) {
    const overSummaries: EventType[][] = [];
    let validBallCount = 0;
    let currentOver: EventType[] = [];
    for (const ballEvent of ballEvents) {
      currentOver.push(ballEvent);
      if (!invalidBalls.includes(ballEvent) && !ballEvent.includes("-3")) {
        validBallCount++;
        if (validBallCount === 6) {
          overSummaries.push(currentOver);
          currentOver = [];
          validBallCount = 0;
          ballLimitInOver = 6;
        }
      } else ballLimitInOver++;
    }

    if (validBallCount >= 0 && currentOver.length > 0) {
      overSummaries.push(currentOver);
    }

    return overSummaries;
  }
  const overSummaries: EventType[][] = generateOverSummary(balls);

  const chartSummaryData = overSummaries.map((summary, i) => ({
    name: i < 9 ? `Over ${i + 1}` : i + 1,
    runs: calcRuns(summary),
  }));

  const curOverIndex = Math.floor(totalBalls / 6);
  const curOverRuns = calcRuns(overSummaries[curOverIndex]);
  const curOverWickets = calcWickets(overSummaries[curOverIndex]);

  function handleScore(e: React.MouseEvent<HTMLButtonElement>) {
    const event = e.currentTarget.value;
    createBallEvent({
      type: event,
      batsmanId: "65ec3e4d9c8d41462b3505b8",
      bowlerId: "65ec3e4d9c8d41462b3505be",
      matchId,
    });
  }

  const handleUndo = () => undoBallEvent(matchId!);

  return (
    <>
      <Card className="relative p-2 max-sm:w-full max-sm:border-0 sm:w-96">
        <Loader
          className={cn("invisible absolute", {
            "visible animate-spin": isPending,
          })}
        />
        <DangerActions
          handleRestart={() => deleteAllBallEvents(matchId)}
          handleUndo={handleUndo}
        />
        <CardContent className="space-y-4 max-sm:p-0">
          <ScoreWrapper
            runs={runs}
            wickets={wickets}
            totalBalls={totalBalls}
            runRate={runRate}
          />
          <ul className="flex justify-start gap-2 overflow-x-auto">
            {Array.from({ length: ballLimitInOver }, (_, i) => (
              <BallSummary key={i} event={overSummaries[curOverIndex]?.[i]} />
            ))}
          </ul>

          <FooterSummary
            extras={extras}
            curOverRuns={curOverRuns}
            curOverWickets={curOverWickets}
            runRate={runRate}
            chartSummaryData={chartSummaryData}
            overSummaries={overSummaries}
          />
        </CardContent>
        <Separator className="my-4 sm:my-4" />
        <ScoreButtons handleScore={handleScore} ballEvents={ballEvents} />
      </Card>
    </>
  );
}

export default ScorerLayout;
