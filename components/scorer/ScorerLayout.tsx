"use client";

import { EventType } from "@/types";
import { calcRuns, calcWickets, getIsInvalidBall } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import DangerActions from "./DangerActions";
import ScoreDisplay from "./ScoreDisplay";
import BallSummary from "./BallSummary";
import ScoreButtons from "./ScoreButtons";
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
import { strikeChangers } from "@/lib/constants";
import Tools from "./Tools";
import { useTeamById } from "@/hooks/api/team/useTeamById";
import { TypographyH4 } from "../ui/typography";

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

  const { team } = useTeamById(match?.teamIds?.[match.curTeam]!);

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

  // TODO: Mantain strike with sync of events if possible
  const [onStrikeBatsman, setOnStrikeBatsman] = useState(0);

  const balls = events?.map((event) => event.type as EventType);

  const totalBalls = balls?.filter((ball) => getIsInvalidBall(ball)).length;

  const [isBowlerSelected, setIsBowlerSelected] = useState(true);

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
  }, [totalBalls]);

  if (!fetchedEvents || !balls) return <p>loading...</p>;

  // ** Calculations & Derived states
  const runs = calcRuns(balls);
  const wickets = calcWickets(balls);
  const runRate = Number(totalBalls ? ((runs / totalBalls) * 6).toFixed(2) : 0);
  // const extras = balls.filter(
  //   (ball) => ball === "-2" || ball.includes("-3"),
  // ).length;

  const showSelectBatsman =
    curPlayers.filter((player) => player.type === "batsman").length !== 2;
  const showSelectBowler =
    (!curPlayers.find((player) => player.type === "bowler") &&
      !showSelectBatsman) ||
    !isBowlerSelected;

  // ** Over Summary
  let ballLimitInOver = 6;
  function generateOverSummary(ballEvents: EventType[]) {
    const overSummaries: EventType[][] = [];
    let validBallCount = 0;
    let currentOver: EventType[] = [];
    for (const ballEvent of ballEvents) {
      const isInvalidBall = getIsInvalidBall(ballEvent);
      currentOver.push(ballEvent);
      if (isInvalidBall) {
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

    const matchBalls = match?.overs! * 6;
    const isLastBallOfOver =
      totalBalls % 6 === 5 && totalBalls > 0 && matchBalls - 1 !== totalBalls;
    if (isLastBallOfOver) setIsBowlerSelected(false);
    else if (totalBalls === matchBalls - 1 && totalBalls > 0)
      udpateMatch(
        {
          id: matchId,
          curPlayers: [],
          curTeam: Number(!Boolean(match?.curTeam)),
        },
        { onSuccess: () => toast.success("Auto saved and inning changed") },
      );
  }

  const handleUndo = () => {
    const isFirstBallOfOver = totalBalls % 6 === 1 && totalBalls > 0;
    const isLastBallOfOver = totalBalls % 6 === 0 && totalBalls > 0;
    setIsModified(true);
    // TODO: Improve this logic
    // Explanation: Changing strike twice to tackle strike change on first ball of over
    if (isLastBallOfOver) changeStrike();
    if (strikeChangers.includes(events[events.length - 1]?.type)) {
      if (isFirstBallOfOver) changeStrike();
      changeStrike();
    }

    setEvents(events.slice(0, -1));
  };

  console.log("curTeam", match?.curTeam);
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
        curPlayers: updatedCurPlayers,
      });

      if (updatedCurPlayers.some((player) => player.type === "bowler"))
        setIsBowlerSelected(true);
    }

    setIsModified(false);
  }

  function handleRestart() {
    deleteAllBallEvents(matchId);
    udpateMatch({
      id: matchId,
      curPlayers: [],
      curTeam: 0,
    });
    setOnStrikeBatsman(0);
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
          <TypographyH4 className="mt-10">{team?.name}</TypographyH4>
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
          <Tools
            chartSummaryData={chartSummaryData}
            overSummaries={overSummaries}
            runRate={runRate}
            curPlayers={curPlayers}
            setCurPlayers={setCurPlayers}
            events={events}
            handleSave={handleSave}
            match={match!}
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
          handleUndo={() => {
            handleUndo();
            setCurPlayers(match?.curPlayers || []);
            changeStrike();
          }}
        />
        <SelectBowler
          open={showSelectBowler}
          curPlayers={curPlayers}
          setCurPlayers={setCurPlayers}
          match={match!}
          handleSave={handleSave}
          handleUndo={() => {
            handleUndo();
            setIsBowlerSelected(true);
          }}
        />
      </Card>
    </>
  );
}

export default ScorerLayout;
