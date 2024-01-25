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

  let ballLimitInOver = 6;
  function generateOverSummary(ballEvents: EventType[]) {
    const overSummaries = [];
    let validBallCount = 0;
    let currentOver = [];
    for (const ballEvent of ballEvents) {
      currentOver.push(ballEvent);

      if (!invalidBalls.includes(ballEvent)) {
        validBallCount++;
        if (validBallCount === 6) {
          overSummaries.push(currentOver);
          currentOver = [];
          validBallCount = 0;
        }
      } else ballLimitInOver++;
    }

    if (validBallCount >= 0 && currentOver.length > 0) {
      overSummaries.push(currentOver);
    }

    return overSummaries;
  }

  const overSummaries = generateOverSummary(balls);
  console.log(overSummaries);

  const totalBalls = balls.filter((d) => !invalidBalls.includes(d)).length;
  const runs = balls
    .filter((ball) => ball !== "-1")
    .map((ball) => ball.replace("-3", "1").replace("-2", "1"))
    .reduce((acc, cur) => acc + +cur, 0);
  const wickets = balls.filter((ball) => ball === "-1").length;

  // stats - short
  const curOverIndex = Math.floor(totalBalls / 6);
  const curOverRuns = overSummaries[curOverIndex]
    ?.filter((ball) => ball !== "-1")
    .map((ball) => ball.replace("-3", "1").replace("-2", "1"))
    .reduce((acc, cur) => acc + Number(cur), 0);
  const curOverWickets = overSummaries[curOverIndex]?.filter(
    (ball) => ball === "-1"
  ).length;

  const extras = balls.filter((ball) => ball === "-2" || ball === "-3");

  function handleScore(e: React.MouseEvent<HTMLButtonElement>) {
    const event = e.currentTarget.value;

    setBalls((pre) => [...pre, event as EventType]);
  }

  function handleUndo() {
    setBalls((prev) => prev.slice(0, -1));
  }

  return (
    <Card className="max-sm:w-full sm:w-96 border-0">
      <div className="flex divide-x">
        <div className="w-full">
          {/* <CardHeader className='pt-4'>
            <CardTitle>India</CardTitle>
          </CardHeader> */}
          <CardContent className="p-0">
            <div className="">
              <h2 className="block text-center font-semibold text-7xl tabular-nums mb-5">
                {runs}/{wickets}
              </h2>
              <div className="text-center opacity-50">
                <span>
                  ({curOverIndex}
                  {totalBalls % 6 ? `.${totalBalls % 6}` : ""})
                </span>
                {" | "}
                <span>
                  RR: {runs ? ((runs / totalBalls) * 6).toFixed(2) : 0}
                </span>
              </div>
            </div>
            <div className="w-full">
              <ul className="flex gap-2 w-full overflow-x-auto justify-st">
                {Array.from(
                  {
                    length: ballLimitInOver,
                  },
                  (_, i) => (
                    <BallSummary
                      key={i}
                      summary={overSummaries[curOverIndex]?.[i] as EventType}
                    />
                  )
                )}
              </ul>
            </div>
          </CardContent>
        </div>
      </div>
      <Separator className="my-4" />
      <CardContent className="space-y-2 p-0">
        <div className="flex gap-1 justify-center w-full">
          {["0", "1", "2", "3"].map((event, i) => (
            <Button
              key={i}
              className="w-full h-16 text-lg"
              value={event}
              onClick={handleScore}
            >
              {event}
            </Button>
          ))}
        </div>
        <div className="flex gap-1 justify-center w-full">
          <Button
            className="w-full h-16 text-lg bg-emerald-500 text-emerald-50 dark:bg-emerald-600"
            value="4"
            onClick={handleScore}
          >
            4
          </Button>
          <Button
            className="w-full h-16 text-lg bg-amber-400 text-amber-950 dark:bg-amber-600 dark:text-amber-50"
            value="6"
            onClick={handleScore}
          >
            6
          </Button>
        </div>
        <div className="flex gap-1 justify-center w-full">
          {["-2", "-3"].map((event, i) => (
            <Button
              key={i}
              className="w-full h-16 text-lg"
              value={event}
              onClick={handleScore}
            >
              {events[event]}
            </Button>
          ))}
          <Button
            className="w-full h-16 text-lg"
            variant="destructive"
            value="-1"
            onClick={handleScore}
          >
            OUT
          </Button>
        </div>
      </CardContent>
      <Separator className="mb-4" />
      <CardFooter className="block px-0">
        <div className="gap-2 flex pb-6">
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
        </div>
        <div className="bg-muted text-primary w-full left-0 rounded-md flex items-center p-2">
          <span>Extras: {extras.length}</span>
          <Separator
            orientation="vertical"
            className="bg-muted-foreground h-6 mx-3"
          />
          <span>
            Current Over: {curOverRuns || 0}/{curOverWickets || 0}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}

export default ScorerLayout;
