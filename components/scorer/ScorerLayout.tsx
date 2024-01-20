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

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import RestartButton from "./RestartButton";

interface ScoreType {
  type: "score" | "extra" | "wicket" | "dot";
  value?: number;
}

interface StateHistory {
  runs: number[];
  balls: number[];
  wicket: number[];
  currentBattingTeam: number;
}

function ScorerLayout() {
  const teams = ["India", "Australia"];
  // const oversToPlay = 8;
  const [runs, setRuns] = useState<number[]>([0, 0]);
  const [balls, setBalls] = useState<number[]>([0, 0]);
  const [wicket, setWicket] = useState<number[]>([0, 0]);
  const [currentBattingTeam, setCurrentBattingTeam] = useState<number>(0);

  const [history, setHistory] = useState<StateHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const [overSummary, setOverSummary] = useState<(number | "Wicket")[]>([]);

  const [overBalls, setOverBalls] = useState(6);

  function increaseRuns(run: number) {
    setRuns((prevRuns) =>
      prevRuns.map((val, index) =>
        index === currentBattingTeam ? val + run : val
      )
    );
  }

  function increaseBalls() {
    setBalls((prevBalls) =>
      prevBalls.map((val, index) =>
        index === currentBattingTeam ? val + 1 : val
      )
    );
  }

  function increaseWicket() {
    setWicket((prevWicket) =>
      prevWicket.map((val, index) =>
        index === currentBattingTeam ? val + 1 : val
      )
    );
  }

  function handleUndo() {
    if (historyIndex >= 0) {
      const prevState = history[historyIndex];
      setRuns([...prevState.runs]);
      setBalls([...prevState.balls]);
      setWicket([...prevState.wicket]);
      setCurrentBattingTeam(prevState.currentBattingTeam);
      setHistoryIndex((prevIndex) => prevIndex - 1);
      overSummary.pop();
    }
  }

  function handleScoreClick(score: ScoreType) {
    // Save current state before updating
    const currentState: StateHistory = {
      runs: [...runs],
      balls: [...balls],
      wicket: [...wicket],
      currentBattingTeam,
    };

    // Update history with current state
    setHistory((prevHistory) => [
      ...prevHistory.slice(0, historyIndex + 1),
      currentState,
    ]);
    setHistoryIndex((prevIndex) => prevIndex + 1);

    switch (score.type) {
      case "score":
        increaseRuns(score.value || 0);
        increaseBalls();
        setOverSummary((prev) => [...prev, score.value || 0]);
        break;
      case "dot":
        increaseBalls();
        setOverSummary((prev) => [...prev, 0]);
        break;
      case "wicket":
        increaseWicket();
        increaseBalls();
        setOverSummary((prev) => [...prev, "Wicket"]);
        break;
      case "extra":
        increaseRuns(1);
        setOverBalls((prev) => {
          prev++;
          return prev;
        });
        setOverSummary((prev) => [...prev, score.value || 0]);
        break;
    }
  }

  useEffect(() => {
    if (overSummary.length === overBalls) {
      setOverSummary([]);
      setOverBalls(6);
    }
  }, [overSummary, overBalls]);

  return (
    <Card className="max-sm:w-full">
      <div className="flex divide-x mt-4">
        <div className="w-full">
          <CardHeader className="pt-4">
            <CardTitle>{teams[currentBattingTeam]}</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <h2 className="inline pr-4 leading-7 font-semibold text-4xl tabular-nums">
              {runs[currentBattingTeam]}/{wicket[currentBattingTeam]}
            </h2>
            <p className="inline text-lg">
              ({Math.floor(balls[currentBattingTeam] / 6)}
              {balls[currentBattingTeam] % 6
                ? `.${balls[currentBattingTeam] % 6}`
                : ""}
              )
            </p>
            <div className="pt-6 w-full">
              <ul className="flex gap-2 w-full flex-wrap">
                {Array.from({ length: overBalls }, (_, i) => (
                  <li
                    className={cn(
                      "size-8 h-8 leading-8 text-center rounded-full",
                      {
                        "bg-primary text-primary-foreground":
                          overSummary[i] !== undefined,
                        "bg-muted": overSummary[i] === undefined,
                      }
                    )}
                  >
                    {overSummary[i]}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </div>
      </div>
      <Separator className="mt-4 mb-6" />
      <CardContent className="space-y-6">
        <ScoreButtonWrapper>
          <Button
            className="size-12 max-sm:size-full text-lg"
            onClick={() => handleScoreClick({ type: "score", value: 1 })}
          >
            1
          </Button>
          <Button
            className="size-12 max-sm:size-full text-lg"
            onClick={() => handleScoreClick({ type: "score", value: 2 })}
          >
            2
          </Button>
          <Button
            className="size-12 max-sm:size-full text-lg"
            onClick={() => handleScoreClick({ type: "score", value: 4 })}
          >
            4
          </Button>
          <Button
            className="size-12 max-sm:size-full text-lg"
            onClick={() => handleScoreClick({ type: "score", value: 6 })}
          >
            6
          </Button>
        </ScoreButtonWrapper>
        <ScoreButtonWrapper>
          <Button
            className="w-full h-12 text-lg"
            onClick={() => handleScoreClick({ type: "dot" })}
          >
            Dot ball
          </Button>
          <Button
            className="w-full h-12 text-lg"
            onClick={() => handleScoreClick({ type: "wicket" })}
          >
            Wicket
          </Button>
        </ScoreButtonWrapper>
        <ScoreButtonWrapper>
          <Button
            className="w-full h-12 text-lg"
            onClick={() => handleScoreClick({ type: "extra", value: 7 })}
          >
            No ball
          </Button>
          <Button
            className="w-full h-12 text-lg"
            onClick={() => handleScoreClick({ type: "extra", value: 8 })}
          >
            Wide
          </Button>
        </ScoreButtonWrapper>
      </CardContent>
      <CardFooter className="gap-2">
        <RestartButton
          onClick={() => {
            setRuns([0, 0]);
            setWicket([0, 0]);
            setBalls([0, 0]);
            setCurrentBattingTeam(0);
            setHistory([]);
            setHistoryIndex(-1);
            setOverSummary([]);
            setOverBalls(6);
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

function ScoreButtonWrapper({ children }: { children: React.ReactNode }) {
  return <div className="flex gap-4 justify-center w-full">{children}</div>;
}
export default ScorerLayout;
