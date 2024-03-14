"use client";

import { EventType } from "@/types";
import { calcRuns, calcWickets } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import DangerActions from "./DangerActions";
import ScoreDisplay from "./ScoreDisplay";
import BallSummary from "./BallSummary";
import ScoreButtons from "./ScoreButtons";
import FooterSummary from "./FooterSummary";
import { BallEvent, CurPlayer } from "@prisma/client";
import { useSaveBallEvents } from "@/hooks/api/ballEvent/useCreateBallEvent";
import { useDeleteAllBallEvents } from "@/hooks/api/ballEvent/useDeleteAllBallEvents";
import { useEffect, useState } from "react";
import { CreateBallEventSchema } from "@/lib/validation/ballEvent";
import LoadingButton from "../ui/loading-button";
import { useEventsById } from "@/hooks/api/ballEvent/useEventsById";
import { toast } from "sonner";
import { useMatchById } from "@/hooks/api/match/useMatchById";
import SelectBatsman from "../players-selection/SelectBatsman";
import BowlerScores from "./BowlerScores";
import BatsmanScores from "./BatsmanScores";
import { useUpdateMatch } from "@/hooks/api/match/useUpdateMatch";

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
  const { events: fetchedEvents } = useEventsById(matchId);

  const { match } = useMatchById(matchId);

  const { createBallEvent, isPending } = useSaveBallEvents();
  const { udpateMatch } = useUpdateMatch();
  const { deleteAllBallEvents } = useDeleteAllBallEvents();

  const [curPlayers, setCurPlayers] = useState<CurPlayer[]>(
    match?.curPlayers || [],
  );
  const [events, setEvents] = useState<CreateBallEventSchema[] | BallEvent[]>(
    [],
  );
  const [isModified, setIsModified] = useState(false);

  console.log(curPlayers);

  const [onStrikeBatsman, setOnStrikeBatsman] = useState(0);

  const changeStrike = () => setOnStrikeBatsman((prev) => (prev === 0 ? 1 : 0));

  useEffect(() => {
    setEvents(fetchedEvents as BallEvent[]);
  }, [fetchedEvents]);

  useEffect(() => {
    if (match?.curPlayers) setCurPlayers(match.curPlayers);
  }, [match?.curPlayers]);

  const balls = events?.map((event) => event.type as EventType);

  const invalidBalls = ["-3", "-2"];
  const totalBalls = balls?.filter(
    (ball) => !invalidBalls.includes(ball) && !ball.includes("-3"),
  ).length;

  useEffect(() => {
    const isLastBallOfOver = totalBalls % 6 === 0 && totalBalls > 0;

    if (isLastBallOfOver) changeStrike();
  }, [fetchedEvents, totalBalls]);

  if (!fetchedEvents || !balls) return <p>loading...</p>;

  const runs = calcRuns(balls);
  const wickets = calcWickets(balls);

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

  function handleStrikeChange(ballEventType: EventType) {
    const strikeChangers = ["1", "3", "-4"]; // '-4' is for swap manually without run
    if (strikeChangers.includes(ballEventType)) changeStrike();
  }

  function handleScore(e: React.MouseEvent<HTMLButtonElement>) {
    setIsModified(true);
    const event = e.currentTarget.value;
    setEvents([
      ...events,
      {
        type: event,
        batsmanId: curPlayers?.[onStrikeBatsman].id!,
        bowlerId: curPlayers?.[2]?.id || "65ec3e4d9c8d41462b3505b9",
        matchId,
      },
    ]);

    if (event === "-1") {
      // const updatedPlayers = [curPlayers?.[Number(!onStrikeBatsman)]];
      // udpateMatch({
      //   id: matchId,
      //   curPlayers: updatedPlayers as CurPlayer[],
      // });
      const updatedPlayers = [curPlayers?.[Number(!onStrikeBatsman)]];
      setCurPlayers(updatedPlayers as CurPlayer[]);
    }

    handleStrikeChange(
      (event.includes("-3") ? event.slice(-1) : event) as EventType,
    );
  }

  const handleUndo = () => setEvents(events.slice(0, -1));

  function handleSave() {
    createBallEvent(events, {
      onSuccess: () => toast.success("Score saved successfully"),
    });

    udpateMatch({
      id: matchId,
      curPlayers,
    });

    setIsModified(false);
  }

  return (
    <>
      <Card className="relative p-2 max-sm:w-full max-sm:border-0 sm:w-96">
        <div className="absolute left-0 top-0 flex w-full items-center justify-between p-2">
          <div>
            <LoadingButton
              loading={isPending}
              disabled={isPending || !isModified}
              onClick={handleSave}
            >
              {isPending ? "Saving..." : "Save"}
            </LoadingButton>
          </div>
          <DangerActions
            handleRestart={() => deleteAllBallEvents(matchId)}
            handleUndo={handleUndo}
          />
        </div>
        <CardContent className="space-y-4 max-sm:p-0">
          <ScoreDisplay
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
          <BatsmanScores
            onStrikeBatsman={onStrikeBatsman}
            playerIds={
              curPlayers
                .filter(({ type }) => type === "batsman")
                ?.map(({ id }) => id)!
            }
            events={events as BallEvent[]}
          />
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
        <Separator className="my-4 sm:my-4" />

        <BowlerScores
          playerId={curPlayers?.[2]?.id!}
          events={events as BallEvent[]}
        />
        <SelectBatsman
          curPlayers={curPlayers}
          setCurPlayers={setCurPlayers}
          events={events!}
          match={match!}
          open={curPlayers.length !== 2}
        />
      </Card>
    </>
  );
}

export default ScorerLayout;
