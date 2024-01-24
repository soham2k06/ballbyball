"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

import { useState } from "react";
import RestartButton from "./RestartButton";
import BallSummary from "./BallSummary";
import { EventType } from "@/types";

export const events: Record<string, string> = {
  "-3": "NB",
  "-2": "WD",
  "-1": "W",
  "0": "0",
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
};

function ScorerLayout() {
  const [balls, setBalls] = useState<EventType[]>([]);

  const invalidBalls = ["-3", "-2"];

  const totalBalls = balls.filter((d) => !invalidBalls.includes(d)).length;
  const runs = balls
    .filter((ball) => ball !== "-1")
    .map((ball) => ball.replace("-3", "1").replace("-2", "1"))
    .reduce((acc, cur) => acc + +cur, 0);
  const wickets = balls.filter((ball) => ball === "-1").length;
  const extras = balls.filter((ball) => ball === "-2" || ball === "-3");

  const [overSummaries, setOverSummaries] = useState<Array<Array<EventType>>>(
    []
  );
  const [curOverIndex, setCurOverIndex] = useState(0);
  const [overBalls, setOverBalls] = useState(6);

  const validCount = calculateValidCount();

  function calculateValidCount() {
    return overSummaries.reduce((total, overBalls) => {
      if (Array.isArray(overBalls)) {
        const validNumbers = overBalls.filter((number) => number);
        return total + validNumbers.length;
      }
      return total;
    }, 0);
  }

  const handleScore = (e: React.MouseEvent<HTMLButtonElement>) => {
    const event = e.currentTarget.value;

    setBalls((pre) => [...pre, event as EventType]);

    // Summary
    const newSummaries = [...overSummaries];

    if (invalidBalls.includes(event)) {
      setOverBalls((prevOverBalls) => prevOverBalls + 1);
    }
    if (newSummaries.length > 0 && newSummaries[curOverIndex].length === 0) {
      newSummaries[curOverIndex].push(event as EventType);
    } else {
      if (
        newSummaries.length === 0 ||
        newSummaries[curOverIndex].length === 6
      ) {
        newSummaries.push([event as EventType]);
        setCurOverIndex(newSummaries.length - 1);
        setOverBalls(6);
      } else {
        newSummaries[curOverIndex].push(event as EventType);
      }
    }

    setOverSummaries(newSummaries);
  };

  function handleUndo() {
    setBalls((prev) => prev.slice(0, -1));

    const newSummaries = [...overSummaries];

    if (newSummaries.length > 0) {
      if (curOverIndex > 0 && newSummaries[curOverIndex].length === 0) {
        newSummaries.splice(curOverIndex, 1);
        setCurOverIndex(curOverIndex - 1);

        setOverBalls(6);
      } else if (newSummaries[curOverIndex].length > 0) {
        newSummaries[curOverIndex].pop();
      }

      setOverSummaries(newSummaries);
    }
  }

  return (
    <Card className="max-sm:w-full sm:w-96">
      <div className="flex divide-x mt-4">
        <div className="w-full">
          <CardHeader className="pt-4">
            <CardTitle>India</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-x-4">
              <h2 className="inline leading-7 font-semibold text-4xl tabular-nums">
                {runs}/{wickets}
              </h2>
              <span className="text-lg">
                ({Math.floor(totalBalls / 6)}
                {totalBalls % 6 ? `.${totalBalls % 6}` : ""})
              </span>
              <span className="text-lg">
                RR: {runs ? ((runs / totalBalls) * 6).toFixed(2) : 0}
              </span>
            </div>
            <div className="pt-6 w-full">
              <ul className="flex gap-2 w-full overflow-x-auto">
                {overSummaries[Math.floor(totalBalls / 6)]?.map(
                  (summary, i) => (
                    <BallSummary key={i} summary={summary} />
                  )
                )}
              </ul>
            </div>
          </CardContent>
        </div>
      </div>
      <Separator className="mt-4 mb-6" />
      <CardContent className="space-y-6">
        <ScoreButtonWrapper>
          {["0", "1", "2", "3"].map((event, i) => (
            <Button
              key={i}
              className="size-full text-lg"
              value={event}
              onClick={handleScore}
            >
              {event}
            </Button>
          ))}
        </ScoreButtonWrapper>
        <ScoreButtonWrapper>
          <Button
            className="size-full text-lg bg-emerald-500 text-emerald-50 dark:bg-emerald-600"
            value="4"
            onClick={handleScore}
          >
            4
          </Button>
          <Button
            className="size-full text-lg bg-amber-400 text-amber-950 dark:bg-amber-600 dark:text-amber-50"
            value="6"
            onClick={handleScore}
          >
            6
          </Button>
        </ScoreButtonWrapper>
        <ScoreButtonWrapper>
          {["-2", "-3"].map((event, i) => (
            <Button
              key={i}
              className="size-full text-lg"
              value={event}
              onClick={handleScore}
            >
              {events[event]}
            </Button>
          ))}
        </ScoreButtonWrapper>
      </CardContent>
      <CardFooter className="gap-2">
        <RestartButton
          onClick={() => {
            setBalls([]);
          }}
        />
        <Button
          size="sm"
          variant="destructive"
          className="w-full"
          onClick={handleUndo}
        >
          Undo
        </Button>
      </CardFooter>
    </Card>
  );
}

export default ScorerLayout;

function ScoreButtonWrapper({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-4 justify-center w-full">{children}</div>;
}
