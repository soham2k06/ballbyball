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
import SelectBowler from "../players-selection/SelectBowler";

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

  // ** States
  const [curPlayers, setCurPlayers] = useState<CurPlayer[]>(
    match?.curPlayers || [],
  );
  const [events, setEvents] = useState<CreateBallEventSchema[] | BallEvent[]>(
    [],
  );
  const [isModified, setIsModified] = useState(false);
  const [onStrikeBatsman, setOnStrikeBatsman] = useState(0);

  const strikeChangers = ["1", "3", "-4"]; // '-4' is for swap manually without run
  const balls = events?.map((event) => event.type as EventType);

  const invalidBalls = ["-3", "-2"];
  const totalBalls = balls?.filter(
    (ball) => !invalidBalls.includes(ball) && !ball.includes("-3"),
  ).length;

  const changeStrike = () => setOnStrikeBatsman((prev) => (prev === 0 ? 1 : 0));

  // ** Effects
  useEffect(() => {
    setEvents(fetchedEvents as BallEvent[]);
  }, [fetchedEvents]);

  useEffect(() => {
    if (match?.curPlayers) setCurPlayers(match.curPlayers);
  }, [match?.curPlayers]);

  useEffect(() => {
    const isLastBallOfOver = totalBalls % 6 === 0 && totalBalls > 0;
    if (isLastBallOfOver) changeStrike();
  }, [fetchedEvents, totalBalls]);

  if (!fetchedEvents || !balls) return <p>loading...</p>;

  // ** Calculations & Derived states
  const runs = calcRuns(balls);
  const wickets = calcWickets(balls);
  const runRate = Number(totalBalls ? ((runs / totalBalls) * 6).toFixed(2) : 0);
  const extras = balls.filter(
    (ball) => ball === "-2" || ball.includes("-3"),
  ).length;

  const showSelectBatsman =
    curPlayers.filter((player) => player.type === "batsman").length !== 2;
  const showSelectBowler =
    !curPlayers.find((player) => player.type === "bowler") &&
    !showSelectBatsman;

  // ** Over Summary
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

  // ** Handlers
  function handleStrikeChange(ballEventType: EventType) {
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
        bowlerId: curPlayers?.[2]?.id,
        matchId,
      },
    ]);

    if (event === "-1") {
      const updatedPlayers = curPlayers.filter((player) => {
        return player.id !== curPlayers?.[onStrikeBatsman].id;
      });
      setCurPlayers(updatedPlayers as CurPlayer[]);
    }

    handleStrikeChange(
      (event.includes("-3") ? event.slice(-1) : event) as EventType,
    );
  }

  const handleUndo = () => {
    const isLastBallOfOver = totalBalls % 6 === 1 && totalBalls > 0;

    // TODO: Improve this logic
    // Explanation: Changing strike twice to tackle strike change on first ball of over
    if (strikeChangers.includes(events[events.length - 1]?.type)) {
      if (isLastBallOfOver) changeStrike();
      changeStrike();
    }

    setEvents(events.slice(0, -1));
  };

  function handleSave(_: unknown, updatedCurPlayers?: CurPlayer[]) {
    if (balls.length) {
      createBallEvent(events, {
        onSuccess: () =>
          toast.success(
            !!updatedCurPlayers
              ? "Score auto saved"
              : "Score saved successfully",
          ),
      });
    }

    if (updatedCurPlayers) {
      udpateMatch({
        id: matchId,
        curPlayers: updatedCurPlayers!,
      });
    }

    setIsModified(false);
  }

  function handleRestart() {
    deleteAllBallEvents(matchId);
    udpateMatch({
      id: matchId,
      curPlayers: [],
    });
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
            handleRestart={handleRestart}
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
          playerId={curPlayers.find((player) => player.type === "bowler")?.id!}
          events={events as BallEvent[]}
        />
        {/* TODO:
         Create a single component and include both selection below
         - Create a hook to tackle on submit
         */}
        <SelectBatsman
          open={showSelectBatsman}
          curPlayers={curPlayers}
          setCurPlayers={setCurPlayers}
          events={events}
          match={match!}
          handleSave={handleSave}
        />
        <SelectBowler
          open={showSelectBowler}
          curPlayers={curPlayers}
          setCurPlayers={setCurPlayers}
          match={match!}
          handleSave={handleSave}
        />
      </Card>
    </>
  );
}

export default ScorerLayout;
