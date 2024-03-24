"use client";

import { useEffect, useState } from "react";

import { BallEvent, CurPlayer } from "@prisma/client";
import { toast } from "sonner";

import { EventType } from "@/types";

import { calcRuns, generateOverSummary, getScore } from "@/lib/utils";
import { ballEvents, strikeChangers } from "@/lib/constants";
import { CreateBallEventSchema } from "@/lib/validation/ballEvent";

import {
  useDeleteAllBallEvents,
  useEventsByMatchId,
  useSaveBallEvents,
} from "@/apiHooks/ballEvent/";
import { useMatchById } from "@/apiHooks/match";
import { useUpdateMatch } from "@/apiHooks/match";

import { Card, CardContent } from "@/components/ui/card";
import LoadingButton from "@/components/ui/loading-button";
import { Separator } from "@/components/ui/separator";

import { SelectBatsman, SelectBowler } from "@/components/players-selection";

import DangerActions from "./DangerActions";
import ScoreDisplay from "./ScoreDisplay";
import BallSummary from "./BallSummary";
import ScoreButtons from "./ScoreButtons";
import BowlerScores from "./BowlerScores";
import BatsmanScores from "./BatsmanScores";
import Tools from "./Tools";
import { TypographyH4 } from "../ui/typography";

function ScorerLayout({ matchId }: { matchId: string }) {
  const { events: fetchedEvents } = useEventsByMatchId(matchId);

  const { match } = useMatchById(matchId);

  const team = match?.teams[match?.curTeam === 0 ? 0 : 1];

  const teamPlayerIds = team?.players.map((player) => player.id);

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

  const playerIds = team?.players.map((player) => player.id) || [];

  const balls = events
    ?.filter((event) => playerIds.includes(event.batsmanId))
    .map((event) => event.type as EventType);

  const [isBowlerSelected, setIsBowlerSelected] = useState(true);

  const changeStrike = () => setOnStrikeBatsman((prev) => (prev === 0 ? 1 : 0));

  const { runs, totalBalls, wickets, runRate } = getScore(balls || []);

  const opponentRuns = calcRuns(
    events
      ?.filter((event) => playerIds.includes(event.bowlerId))
      .map((event) => event.type as EventType),
  );

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

  // Handling after last ball
  useEffect(() => {
    const matchBalls = match?.overs! * 6;
    const isLastBallOfOver = totalBalls % 6 === 0 && totalBalls > 0;
    if (isLastBallOfOver) {
      if (matchBalls !== totalBalls) setIsBowlerSelected(false);

      if (totalBalls === matchBalls && totalBalls) {
        const playerIds = new Set(teamPlayerIds);
        let isInSecondInning = false;

        for (const event of events) {
          if (!playerIds?.has(event.batsmanId)) {
            isInSecondInning = true;
            break;
          }
        }

        if (!isInSecondInning)
          handleSave(0, [], Number(!Boolean(match?.curTeam)));
        else {
          toast.info("Match finished!");
          handleSave(0, match?.curPlayers);
        }
      }
    }
  }, [totalBalls]);

  if (!fetchedEvents || !balls) return <p>loading...</p>;

  const showSelectBatsman =
    curPlayers.filter((player) => player.type === "batsman").length !== 2;
  const showSelectBowler =
    (!curPlayers.find((player) => player.type === "bowler") &&
      !showSelectBatsman) ||
    !isBowlerSelected;

  // ** Over Summary
  let ballLimitInOver = 6;

  const overSummaries: EventType[][] = generateOverSummary({
    ballEvents: balls,
    ballLimitInOver,
  });

  const chartSummaryData = overSummaries.map((summary, i) => ({
    name: i < 9 ? `Over ${i + 1}` : i + 1,
    runs: calcRuns(summary),
  }));

  const curOverIndex = Math.floor(totalBalls / 6);

  // ** Handlers
  function handleStrikeChange(ballEventType: EventType) {
    if (strikeChangers.includes(ballEventType)) changeStrike();
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

  function handleSave(
    _: unknown,
    updatedCurPlayers?: CurPlayer[],
    curTeam?: number,
  ) {
    if (events.length > 0) {
      createBallEvent(events, {
        onSuccess: () => {
          setIsModified(false);
          toast.success(
            !!updatedCurPlayers
              ? "Score auto saved"
              : "Score saved successfully",
          );
        },
      });
    }

    if (updatedCurPlayers) {
      udpateMatch(
        {
          id: matchId,
          curPlayers: updatedCurPlayers,
          ...(curTeam && { curTeam }),
        },
        { onSuccess: () => setIsModified(false) },
      );

      if (updatedCurPlayers.some((player) => player.type === "bowler"))
        setIsBowlerSelected(true);
    }
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
          <p>Opponent: {opponentRuns}</p>
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
