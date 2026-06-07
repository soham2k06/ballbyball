"use client";

import { useEffect, useRef, useState } from "react";

import { deleteCookie, getCookie, setCookie } from "cookies-next";
import { Target } from "lucide-react";

import { generateOverSummary, getScore, round } from "@/lib/utils";
import { EventType } from "@/types";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

import ScoreButtons from "../score-buttons";
import FooterSummary from "../stats/footer-summary";

import BallSummary from "./ball-summary";
import DangerActions from "./danger-actions";
import ScoreDisplay from "./score-display";

function ScorerLayout() {
  const [balls, setBalls] = useState<EventType[]>([]);
  const [target, setTarget] = useState<number | null>(null);
  const [totalOvers, setTotalOvers] = useState<number | null>(null);
  const [showChaseSetup, setShowChaseSetup] = useState(false);
  const [showChaseDetails, setShowChaseDetails] = useState(false);
  const [targetInput, setTargetInput] = useState("");
  const [oversInput, setOversInput] = useState("");
  const chaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { runs, totalBalls, wickets, extras, runRate } = getScore({ balls });
  const { overSummaries, ballLimitInOver } = generateOverSummary(balls);

  const curOverIndex = Math.floor(totalBalls / 6);
  const { runs: curOverRuns, wickets: curOverWickets } = getScore({
    balls: overSummaries[curOverIndex] || [],
  });

  const chaseMode = target !== null && totalOvers !== null;
  const runsNeeded = chaseMode ? target - runs : 0;
  const ballsRemaining = chaseMode ? totalOvers * 6 - totalBalls : 0;
  const rrr =
    chaseMode && ballsRemaining > 0
      ? round((runsNeeded / ballsRemaining) * 6)
      : 0;

  useEffect(() => {
    const savedBalls = getCookie("balls");
    if (savedBalls) setBalls(JSON.parse(savedBalls));
    const savedTarget = getCookie("chase_target");
    const savedOvers = getCookie("chase_overs");
    if (savedTarget && savedOvers) {
      setTarget(Number(savedTarget));
      setTotalOvers(Number(savedOvers));
    }
  }, []);

  // Auto-show chase details for 5s after each over completes
  useEffect(() => {
    if (!chaseMode || totalBalls === 0 || totalBalls % 6 !== 0) return;
    setShowChaseDetails(true);
    if (chaseTimerRef.current) clearTimeout(chaseTimerRef.current);
    chaseTimerRef.current = setTimeout(() => setShowChaseDetails(false), 5000);
    return () => {
      if (chaseTimerRef.current) clearTimeout(chaseTimerRef.current);
    };
  }, [totalBalls, chaseMode]);

  function handleScore(e: React.MouseEvent<HTMLButtonElement>) {
    const event = e.currentTarget.value;
    setBalls((prev) => [...prev, event as EventType]);
    setCookie("balls", JSON.stringify([...balls, event]));
  }

  const handleUndo = () => {
    setBalls((prev) => prev.slice(0, -1));
    setCookie("balls", JSON.stringify(balls.slice(0, -1)));
  };

  const handleSetChase = () => {
    const t = Number(targetInput);
    const o = Number(oversInput);
    if (!t || !o) return;
    setTarget(t);
    setTotalOvers(o);
    setCookie("chase_target", String(t));
    setCookie("chase_overs", String(o));
    setShowChaseSetup(false);
  };

  const handleClearChase = () => {
    setTarget(null);
    setTotalOvers(null);
    setTargetInput("");
    setOversInput("");
    deleteCookie("chase_target");
    deleteCookie("chase_overs");
    setShowChaseSetup(false);
    setShowChaseDetails(false);
  };

  const toggleChaseDetails = () => {
    if (!chaseMode) return;
    if (chaseTimerRef.current) clearTimeout(chaseTimerRef.current);
    setShowChaseDetails((prev) => !prev);
  };

  return (
    <div className="flex w-full justify-center md:p-6">
      <Card className="relative p-2 max-sm:w-full max-sm:border-0 max-sm:shadow-none sm:w-96">
        <div className="absolute left-2 top-2">
          <Button
            size="sm"
            variant={chaseMode ? "default" : "secondary"}
            onClick={() => {
              if (chaseMode) {
                setTargetInput(String(target));
                setOversInput(String(totalOvers));
              }
              setShowChaseSetup(true);
            }}
            className="gap-1 px-2 text-xs"
          >
            <Target size={14} />
            {chaseMode ? `${target}/${totalOvers}ov` : "Chase"}
          </Button>
        </div>

        <Dialog open={showChaseSetup} onOpenChange={setShowChaseSetup}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Chase Target</DialogTitle>
            </DialogHeader>
            <div className="flex gap-3">
              <Input
                type="number"
                placeholder="Target runs"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSetChase()}
              />
              <Input
                type="number"
                placeholder="Overs"
                value={oversInput}
                onChange={(e) => setOversInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSetChase()}
                className="w-28"
              />
            </div>
            <DialogFooter className="flex-row gap-2 sm:justify-between">
              {chaseMode && (
                <Button
                  variant="secondary"
                  onClick={handleClearChase}
                  className="w-full"
                >
                  Clear
                </Button>
              )}
              <Button onClick={handleSetChase} className="w-full">
                Set
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="absolute right-2 top-2">
          <DangerActions
            handleRestart={() => {
              setBalls([]);
              deleteCookie("balls");
            }}
            backLink="/"
            handleUndo={handleUndo}
          />
        </div>
        <CardContent className="space-y-4 max-sm:p-0">
          <ScoreDisplay
            runs={runs}
            wickets={wickets}
            totalBalls={totalBalls}
            runRate={runRate as number}
            chaseMode={chaseMode}
            showChaseDetails={showChaseDetails}
            onToggleChaseDetails={toggleChaseDetails}
            runsNeeded={runsNeeded}
            ballsRemaining={ballsRemaining}
            rrr={rrr}
          />

          <ul className="flex gap-2 overflow-x-auto">
            {Array.from({ length: ballLimitInOver }, (_, i) => (
              <BallSummary key={i} event={overSummaries[curOverIndex]?.[i]} />
            ))}
          </ul>

          <FooterSummary
            extras={extras}
            curOverRuns={curOverRuns}
            curOverWickets={curOverWickets}
            runRate={runRate}
            ballEvents={balls}
          />
        </CardContent>
        <Separator className="my-4" />
        <ScoreButtons handleScore={handleScore} mode="instant" />
      </Card>
    </div>
  );
}

export default ScorerLayout;
