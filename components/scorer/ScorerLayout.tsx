"use client";

import { useEffect, useState } from "react";

import { BallEvent, CurPlayer } from "@prisma/client";
import { toast } from "sonner";

import { EventType, MatchExtended } from "@/types";

import { StatsOpenProvider } from "@/contexts/StatsOpenContext";

import { calcRuns, generateOverSummary, getScore } from "@/lib/utils";
import { strikeChangers } from "@/lib/constants";
import { CreateBallEventSchema } from "@/lib/validation/ballEvent";

import { Card, CardContent } from "@/components/ui/card";
import LoadingButton from "@/components/ui/loading-button";
import { Separator } from "@/components/ui/separator";

import { SelectBatsman, SelectBowler } from "@/components/players-selection";

import DangerActions from "./DangerActions";
import ScoreDisplay from "./ScoreDisplay";
import BallSummary from "./BallSummary";
import ScoreButtons from "../score-buttons/ScoreButtons";
import BowlerScores from "../player-scores/BowlerScores";
import BatsmanScores from "../player-scores/BatsmanScores";
import Tools from "../match-stats/Tools";
import FieldersDialog from "./FieldersDialog";
import MatchSummary from "./MatchSummary";
import TargetInfo from "./TargetInfo";
import ScoreButtonsSkeleton from "../score-buttons/ScoreButtonsSkeleton";
import { useActionMutate } from "@/lib/hooks";
import { updateMatch } from "@/lib/actions/match";
import { deleteAllBallEvents, saveBallEvents } from "@/lib/actions/ball-event";

function ScorerLayout({
  matchId,
  match,
}: {
  matchId: string;
  match: MatchExtended;
}) {
  const ballEventsFromMatch = match?.ballEvents;

  const team = match?.teams[match?.curTeam];
  const opposingTeam = match?.teams[match?.curTeam === 0 ? 1 : 0];

  const teamPlayerIds = team?.players.map((player) => player.id);

  // ** Action hooks
  const { mutate: createBallEvent, isPending } =
    useActionMutate(saveBallEvents);
  const { mutate: updateMutate, isPending: isUpdatingMatch } =
    useActionMutate(updateMatch);
  const { mutate: deleteAllBallEventsMutate } =
    useActionMutate(deleteAllBallEvents);

  // ** States
  const [curPlayers, setCurPlayers] = useState<CurPlayer[]>(
    match?.curPlayers ?? [],
  );
  const [events, setEvents] = useState<CreateBallEventSchema[] | BallEvent[]>(
    match.ballEvents ?? [],
  );
  const [isModified, setIsModified] = useState(false);

  // TODO: Mantain strike with sync of events if possible
  const [onStrikeBatsman, setOnStrikeBatsman] = useState(
    match.strikeIndex ?? 0,
  );

  const [isInSecondInning, setIsInSecondInning] = useState(false);

  const [showScorecard, setShowScorecard] = useState(false);
  const [showMatchSummary, setShowMatchSummary] = useState(false);

  const playerIds = team?.players.map((player) => player.id) || [];

  const balls =
    events
      ?.filter((event) => playerIds.includes(event.batsmanId))
      .map((event) => event.type as EventType) || [];

  const [showSelectBatsman, setShowSelectBatsman] = useState(false);
  const [showSelectBowler, setShowSelectBowler] = useState(false);

  const changeStrike = () => setOnStrikeBatsman((prev) => (prev === 0 ? 1 : 0));

  const [wicketTypeId, setWicketTypeId] = useState<string | null>(null);

  const { runs, totalBalls, wickets, runRate } = getScore(balls || []);

  const opponentEvents = events?.filter((event) =>
    playerIds.includes(event.bowlerId),
  );
  const opponentRuns = calcRuns(
    events
      ?.filter((event) => playerIds.includes(event.bowlerId))
      .map((event) => event.type as EventType),
  );

  // ** Effects

  // Handling initial player selection
  useEffect(() => {
    if (match?.hasEnded) return;
    const getHasPlayer = (type: "batsman" | "bowler") =>
      (curPlayers.length ? curPlayers : match?.curPlayers)?.some(
        (player) => player.type === type,
      );

    const hasBatsman = getHasPlayer("batsman");
    if (!hasBatsman) setShowSelectBatsman((prev) => prev || true);

    const hasBowler = getHasPlayer("bowler");
    if (!hasBowler) setShowSelectBowler(!hasBowler && !showSelectBatsman);
  }, [showSelectBatsman, match?.hasEnded]);

  // Handling strike change on last ball of over
  useEffect(() => {
    const isLastBallOfOver = totalBalls % 6 === 0 && totalBalls > 0;
    if (
      isLastBallOfOver &&
      curPlayers.filter((player) => player.type === "batsman").length === 2
    )
      changeStrike();
  }, [totalBalls]);

  // Check if second inning
  useEffect(() => {
    const playerIds = new Set(teamPlayerIds);
    for (const event of events) {
      if (!playerIds?.has(event.batsmanId)) {
        setIsInSecondInning(true);
        break;
      }
    }
  }, [events]);

  // Handling after last ball
  useEffect(() => {
    if (!match) return;
    const matchBalls = (match?.overs || 0) * 6;
    const isLastBallOfOver = totalBalls % 6 === 0 && totalBalls > 0;

    if (isLastBallOfOver) {
      if (matchBalls !== totalBalls) setShowSelectBowler(true);

      // Check if inning is finished
      if (totalBalls === matchBalls && totalBalls) {
        if (isInSecondInning || match?.hasEnded) handleFinish();
        else handleInningChange();
      }
    }
  }, [totalBalls]);

  // Handling Succesfull Chase
  useEffect(() => {
    const remainingRuns = opponentRuns - runs + 1;
    if (!opponentEvents.length) return;
    if (remainingRuns <= 0) handleFinish();
  }, [runs, opponentRuns]);

  // Handling All out win
  useEffect(() => {
    const isAllOut =
      wickets ===
      (team?.players.length || 0) - (match?.allowSinglePlayer ? 0 : 1);

    if (isAllOut) {
      if (isInSecondInning || match?.hasEnded) handleFinish();
      else {
        toast.info("All out!");
        handleInningChange();
      }
    }
  }, [wickets, match?.hasEnded]);

  // ** Over Summary
  const { overSummaries, ballLimitInOver } = generateOverSummary(balls);

  const curOverIndex = Math.floor(totalBalls / 6);

  // ** Handlers
  function handleStrikeChange(ballEventType: EventType) {
    if (
      strikeChangers.includes(ballEventType) &&
      curPlayers.filter((player) => player.type === "batsman").length === 2
    )
      changeStrike();
  }

  function handleSelectPlayer(payload: CurPlayer[], onSuccess?: () => void) {
    updateMutate(
      { id: matchId, curPlayers: payload },
      {
        onSuccess: () => {
          onSuccess?.();
          if (balls.length)
            createBallEvent(events.map((event) => ({ ...event, matchId })));
          setIsModified(false);
        },
      },
    );
  }

  function handleScore(e: React.MouseEvent<HTMLButtonElement>) {
    setIsModified(true);

    const event = e.currentTarget.value;

    setEvents([
      ...events,
      {
        type: event,
        batsmanId: curPlayers?.[onStrikeBatsman].id!,
        bowlerId: curPlayers.find((player) => player.type === "bowler")?.id,
        matchId,
      },
    ] as CreateBallEventSchema[]);

    if (event.includes("-1")) {
      const updatedPlayers = curPlayers.filter((player) => {
        return player.id !== curPlayers?.[onStrikeBatsman].id;
      });
      setCurPlayers(updatedPlayers as CurPlayer[]);
    }

    handleStrikeChange(
      (event.includes("-3")
        ? event.slice(-1)
        : event.includes("-5")
          ? event.slice(-1)
          : event.includes("-2")
            ? event.slice(-1)
            : event) as EventType,
    );
  }

  function handleWicket(e: React.MouseEvent<HTMLButtonElement>) {
    const event = e.currentTarget.value;

    const wicketType = JSON.parse(event);
    let eventToAdd;

    if (!wicketType.isOtherPlayerInvolved) {
      setShowSelectBatsman(true);
      if (wicketType.id === 1) eventToAdd = `-1`;
      eventToAdd = `-1_${wicketType.id}`;

      handleScore({
        currentTarget: { value: eventToAdd },
      } as React.MouseEvent<HTMLButtonElement>);
    } else setWicketTypeId(wicketType.id);
  }

  function handleWicketWithFielder(
    wicketTypeId: number,
    fielderId: string,
    runsAlongWithRunOut?: number,
  ) {
    setShowSelectBatsman(true);
    handleScore({
      currentTarget: {
        value: `-1_${wicketTypeId}_${fielderId}_${runsAlongWithRunOut}`,
      },
    } as React.MouseEvent<HTMLButtonElement>);
  }

  function handleSave(_: unknown) {
    if (balls.length)
      createBallEvent(
        events.map((event) => ({ ...event, matchId })),
        {
          onSuccess: () => {
            setIsModified(false);
            toast.success("Score saved successfully");
          },
        },
      );

    updateMutate({
      id: matchId,
      strikeIndex: onStrikeBatsman,
    });
  }

  function handleInningChange() {
    setCurPlayers([]);
    setShowSelectBatsman(true);
    setOnStrikeBatsman(0);
    updateMutate({
      id: matchId,
      curPlayers: [],
      curTeam: Number(!Boolean(match?.curTeam)),
    });
    handleSave(0);
  }

  function handleFinish() {
    if (!match?.hasEnded) {
      setShowSelectBatsman(false);
      handleSave(0);
      updateMutate({
        id: matchId,
        hasEnded: true,
      });
      toast.info("Match finished!");
    }
    setShowMatchSummary(true);
  }

  function handleUndo() {
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
  }

  function handleRestart() {
    deleteAllBallEventsMutate(matchId);
    setEvents([]);
    updateMutate({
      id: matchId,
      curPlayers: [],
      curTeam: 0,
      ...(match?.hasEnded && { hasEnded: false }),
    });
    setOnStrikeBatsman(0);

    setShowSelectBatsman(true);
    setCurPlayers([]);
  }

  return (
    <StatsOpenProvider>
      <Card className="relative max-sm:w-full max-sm:border-0 sm:w-96 sm:p-2">
        <div className="absolute left-0 top-0 flex w-full items-center justify-between sm:p-2">
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
        <CardContent className="max-sm:p-0">
          <ScoreDisplay
            curTeam={team?.name}
            runs={runs}
            wickets={wickets}
            totalBalls={totalBalls}
            runRate={runRate}
          />
          {!!opponentEvents.length && (
            <TargetInfo
              runs={runs}
              target={opponentRuns + 1}
              ballsRemaining={(match?.overs ?? 0) * 6 - totalBalls || 0}
              curTeam={team?.name}
            />
          )}

          <ul className="mt-6 flex justify-start gap-2 overflow-x-auto">
            {Array.from({ length: ballLimitInOver }, (_, i) => (
              <BallSummary key={i} event={overSummaries[curOverIndex]?.[i]} />
            ))}
          </ul>
        </CardContent>
        <div className="my-4" />

        <BatsmanScores
          onStrikeBatsman={onStrikeBatsman}
          playerIds={
            curPlayers
              .filter(({ type }) => type === "batsman")
              ?.map(({ id }) => id)!
          }
          events={events as BallEvent[]}
        />
        <div className="my-2 md:my-4" />
        <BowlerScores
          playerId={curPlayers.find((player) => player.type === "bowler")?.id!}
          events={events as BallEvent[]}
        />
        <Separator className="my-3" />
        {!isUpdatingMatch && !isPending ? (
          <ScoreButtons handleScore={handleScore} handleWicket={handleWicket} />
        ) : (
          <ScoreButtonsSkeleton />
        )}
        <div className="mt-4 md:mt-6" />
        <Tools
          curPlayers={curPlayers}
          setCurPlayers={setCurPlayers}
          events={events}
          match={match}
          showScorecard={showScorecard}
          setShowScorecard={setShowScorecard}
        />

        {/* DIALOGS */}
        {!match.hasEnded && (
          <SelectBatsman
            open={showSelectBatsman}
            setOpen={setShowSelectBatsman}
            curPlayers={curPlayers}
            setCurPlayers={setCurPlayers}
            events={events}
            team={{ name: team?.name, players: team?.players }}
            handleUndo={() => {
              handleUndo();
              setCurPlayers(match?.curPlayers || []);
              setShowSelectBatsman(false);
            }}
            handleSelectPlayer={handleSelectPlayer}
            allowSinglePlayer={match?.allowSinglePlayer}
            isLoading={isUpdatingMatch}
            isUpdatingMatch={isUpdatingMatch}
          />
        )}
        {!match.hasEnded && (
          <SelectBowler
            open={showSelectBowler}
            setOpen={setShowSelectBowler}
            curPlayers={curPlayers}
            setCurPlayers={setCurPlayers}
            handleSelectPlayer={handleSelectPlayer}
            team={{ name: opposingTeam?.name, players: opposingTeam?.players }}
            handleUndo={() => {
              handleUndo();
              setShowSelectBowler(false);
            }}
            isUpdatingMatch={isUpdatingMatch}
          />
        )}

        <FieldersDialog
          wicketTypeId={wicketTypeId}
          setWicketTypeId={setWicketTypeId}
          fielders={opposingTeam?.players}
          handleScore={handleWicketWithFielder}
        />
        <MatchSummary
          ballEvents={events}
          open={showMatchSummary}
          setShowScorecard={setShowScorecard}
          match={match}
          handleUndo={() => {
            handleUndo();
            setShowMatchSummary(false);
            updateMutate({
              id: matchId,
              hasEnded: false,
            });
          }}
        />
      </Card>
    </StatsOpenProvider>
  );
}

export default ScorerLayout;
