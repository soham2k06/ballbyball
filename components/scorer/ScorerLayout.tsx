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

interface ScoreType {
  type: "score" | "extra" | "wicket" | "dot";
  value?: number;
}

function ScorerLayout() {
  const teams = ["India", "Australia"];
  const oversToPlay = 8;
  const [runs, setRuns] = useState<number[]>([0, 0]);
  const [balls, setBalls] = useState<number[]>([0, 0]);
  const [wicket, setWicket] = useState<number[]>([0, 0]);
  const [currentBattingTeam, setCurrentBattingTeam] = useState<number>(0);

  function increaseRuns(run: number) {
    const newRuns = [...runs];
    newRuns[currentBattingTeam] += run;
    setRuns(newRuns);
  }

  function increaseBalls() {
    const newBalls = [...balls];
    newBalls[currentBattingTeam]++;
    setBalls(newBalls);
  }
  function increaseWicket() {
    const newWicket = [...wicket];
    newWicket[currentBattingTeam]++;
    setWicket(newWicket);
  }

  function handleScoreClick(score: ScoreType) {
    switch (score.type) {
      case "score":
        increaseRuns(score.value || 0);
        increaseBalls();
        break;
      case "dot":
        increaseBalls();
        break;
      case "wicket":
        increaseWicket();
        increaseBalls();
        break;
      case "extra":
        increaseRuns(1);
        break;
    }
  }
  return (
    <Card>
      <div className="flex divide-x mt-4">
        {/* {teams.map((team, i) => (
          <div key={i} className="w-full">
            <CardHeader className="pt-4">
              <CardTitle>{team}</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              {currentBattingTeam === i ? (
                <p className="leading-7">
                  {runs[i]}/{wicket[i]} ({Math.floor(balls[i] / 6)}.
                  {balls[i] % 6})
                </p>
              ) : (
                "Yet to bat"
              )}
            </CardContent>
          </div>
        ))} */}
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
          </CardContent>
        </div>
      </div>
      <Separator className="mt-4 mb-6" />
      <CardContent className="space-y-6">
        <ScoreButtonWrapper>
          <Button
            className="size-12 text-lg"
            onClick={() => handleScoreClick({ type: "score", value: 1 })}
          >
            1
          </Button>
          <Button
            className="size-12 text-lg"
            onClick={() => handleScoreClick({ type: "score", value: 2 })}
          >
            2
          </Button>
          <Button
            className="size-12 text-lg"
            onClick={() => handleScoreClick({ type: "score", value: 4 })}
          >
            4
          </Button>
          <Button
            className="size-12 text-lg"
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
            onClick={() => handleScoreClick({ type: "extra", value: 0 })}
          >
            No ball
          </Button>
          <Button
            className="w-full h-12 text-lg"
            onClick={() => handleScoreClick({ type: "extra", value: 0 })}
          >
            Wide
          </Button>
        </ScoreButtonWrapper>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="destructive" className="w-full">
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
