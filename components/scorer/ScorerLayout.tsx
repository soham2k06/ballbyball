"use client";

import { useState } from "react";
import { deleteCookie, getCookie, setCookie } from "cookies-next";

import { EventType } from "@/types";
import { calcRuns, calcWickets } from "@/lib/utils";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import DangerActions from "./DangerActions";
import ScoreWrapper from "./ScoreWrapper";
import BallSummary from "./BallSummary";
import ScoreButtons from "./ScoreButtons";
import OverStats from "./OverStats";
import FooterSummary from "./FooterSummary";
import FullOverSummary from "./FullOverSummary";

export const ballEvents: Record<string, string> = {
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

function ScorerLayout() {
  const [balls, setBalls] = useState<EventType[]>(
    JSON.parse((getCookie("balls") as string) || "[]") || []
  );
  const invalidBalls = ["-3", "-2"];

  const runs = calcRuns(balls);
  const wickets = calcWickets(balls);
  const totalBalls = balls.filter(
    (ball) => !invalidBalls.includes(ball) && !ball.includes("-3")
  ).length;

  const runRate = totalBalls ? ((runs / totalBalls) * 6).toFixed(2) : 0;

  const extras = balls.filter(
    (ball) => ball === "-2" || ball.includes("-3")
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
    name: `Over ${i + 1}`,
    runs: calcRuns(summary),
    wickets: summary.filter((ball) => ball === "-1").length,
  }));

  const curOverIndex = Math.floor(totalBalls / 6);
  const curOverRuns = calcRuns(overSummaries[curOverIndex]);
  const curOverWickets = calcWickets(overSummaries[curOverIndex]);

  function handleScore(e: React.MouseEvent<HTMLButtonElement>) {
    const event = e.currentTarget.value;
    setBalls((prev) => [...prev, event as EventType]);
    setCookie("balls", JSON.stringify([...balls, event]));
  }

  const handleUndo = () => {
    setBalls((prev) => prev.slice(0, -1));
    setCookie("balls", JSON.stringify(balls.slice(0, -1)));
  };

  return (
    <>
      <Card className="max-sm:w-full sm:w-96 max-sm:border-0 p-2 relative">
        <DangerActions
          handleRestart={() => {
            setBalls([]);
            deleteCookie("balls");
          }}
          handleUndo={handleUndo}
        />
        <CardContent className="max-sm:p-0 space-y-4">
          <ScoreWrapper
            runs={runs}
            wickets={wickets}
            totalBalls={totalBalls}
            runRate={runRate as number}
          />
          <ul className="flex gap-2 justify-start overflow-x-auto">
            {Array.from({ length: ballLimitInOver }, (_, i) => (
              <BallSummary key={i} event={overSummaries[curOverIndex]?.[i]} />
            ))}
          </ul>

          <FooterSummary
            extras={extras}
            curOverRuns={curOverRuns}
            curOverWickets={curOverWickets}
            runRate={runRate as number}
            chartSummaryData={chartSummaryData}
            overSummaries={overSummaries}
          />
        </CardContent>
        <Separator className="sm:my-4 my-4" />
        <ScoreButtons handleScore={handleScore} ballEvents={ballEvents} />
      </Card>
    </>
  );
}

export default ScorerLayout;
