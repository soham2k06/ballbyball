"use client";

import { useEffect, useState } from "react";

import { BallEvent, CurPlayer } from "@prisma/client";
import { toast } from "sonner";

import { EventType, MatchExtended } from "@/types";

import { StatsOpenProvider } from "@/contexts/StatsOpenContext";

import {
  calcRuns,
  generateOverSummary,
  getIsvalidBall,
  getScore,
} from "@/lib/utils";
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
  // ** Action hooks
  const { mutate: createBallEvent, isPending } =
    useActionMutate(saveBallEvents);
  const { mutate: updateMutate } = useActionMutate(updateMatch);
  const { mutate: deleteAllBallEventsMutate } =
    useActionMutate(deleteAllBallEvents);

  // ** States
  const [hasEnded, setHasEnded] = useState(false);
  const [curTeam, setCurTeam] = useState(match?.curTeam ?? 0);
  const [curPlayers, setCurPlayers] = useState<CurPlayer[]>(
    match?.curPlayers ?? [],
  );
  const [events, setEvents] = useState<CreateBallEventSchema[] | BallEvent[]>(
    match.ballEvents ?? [],
  );
  const [isModified, setIsModified] = useState(false);

  const [canSaveEvents, setCanSaveEvents] = useState(false);

  // TODO: Mantain strike with sync of events if possible
  const [onStrikeBatsman, setOnStrikeBatsman] = useState(
    match.strikeIndex ?? 0,
  );

  const [showScorecard, setShowScorecard] = useState(false);

  const team = match?.teams[curTeam];
  const opposingTeam = match?.teams[curTeam === 0 ? 1 : 0];
  const playerIds = team?.players.map((player) => player.id) || [];

  const isInSecondInning = curTeam === 1;

  const curBowlerId = curPlayers.find((player) => player.type === "bowler")?.id;
  const curBatsmenIds = curPlayers
    .filter((player) => player.type === "batsman")
    .map((player) => player.id);

  const balls =
    events
      ?.filter((event) => playerIds.includes(event.batsmanId))
      .map((event) => event.type as EventType) || [];

  const [showSelectBatsman, setShowSelectBatsman] = useState(false);
  const [showSelectBowler, setShowSelectBowler] = useState(false);

  const changeStrike = () => setOnStrikeBatsman((prev) => (prev === 0 ? 1 : 0));

  const [wicketTypeId, setWicketTypeId] = useState<string | null>(null);

  const { runs, totalBalls, wickets, runRate } = getScore({
    balls,
  });

  const isSLastPlayer = wickets === team?.players.length - 2;

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
    if (hasEnded) return;
    const getHasPlayer = (type: "batsman" | "bowler") =>
      curPlayers?.some((player) => player.type === type);

    const hasBatsman = getHasPlayer("batsman");
    if (!hasBatsman) setShowSelectBatsman((prev) => prev || true);

    const hasBowler = getHasPlayer("bowler");
    if (!hasBowler) setShowSelectBowler(!hasBowler && !showSelectBatsman);
  }, [showSelectBatsman, hasEnded]);

  // Handling strike change on last ball of over
  useEffect(() => {
    const isLastBallOfOver = totalBalls % 6 === 0 && totalBalls > 0;
    if (isLastBallOfOver && curBatsmenIds.length === 2) changeStrike();
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
      if (isInSecondInning || hasEnded) handleFinish();
      else {
        toast.info("All out!");
        handleInningChange();
      }
    }
  }, [wickets, hasEnded]);

  // Handle last ball of inning
  useEffect(() => {
    const matchBalls = (match?.overs || 0) * 6;
    if (totalBalls === matchBalls) {
      if (isInSecondInning || hasEnded) handleFinish();
      else handleInningChange();
    }
  }, []);

  // Handle Save Events
  useEffect(() => {
    if (canSaveEvents) {
      createBallEvent(
        events.map((event) => ({ ...event, matchId })),
        {
          onSuccess: () => {
            setIsModified(false);
            toast.success("Score saved successfully");
          },
        },
      );
    }
  }, [canSaveEvents]);

  // ** Over Summary
  const { overSummaries, ballLimitInOver } = generateOverSummary(balls);

  const curOverIndex = Math.floor(totalBalls / 6);

  // ** Handlers
  function handleStrikeChange(ballEventType: EventType) {
    if (strikeChangers.includes(ballEventType) && curBatsmenIds.length === 2)
      changeStrike();
  }

  function handleSelectPlayer(payload: CurPlayer[], onSuccess?: () => void) {
    setCurPlayers(payload);
    updateMutate(
      { id: matchId, curPlayers: payload },
      {
        onSuccess: () => {
          onSuccess?.();
          if (balls.length)
            createBallEvent(events.map((event) => ({ ...event, matchId })));
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
        bowlerId: curBowlerId,
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

    const matchBalls = (match?.overs || 0) * 6;
    const isLastBallOfOver =
      totalBalls % 6 === 5 && totalBalls > 0 && getIsvalidBall(event);

    if (isLastBallOfOver) {
      if (matchBalls !== totalBalls) setShowSelectBowler(true);

      // Check if inning is finished
      if (totalBalls === matchBalls - 1 && getIsvalidBall(event)) {
        if (isInSecondInning || hasEnded) handleFinish();
        else handleInningChange();
      }
    }
  }

  function handleLastBallInWicket(event: string) {
    const isLastBallOfOver =
      totalBalls % 6 === 5 && totalBalls > 0 && getIsvalidBall(event);
    if (isLastBallOfOver) {
      if (isSLastPlayer) {
        setOnStrikeBatsman(0);
      } else setOnStrikeBatsman(1);
    } else setOnStrikeBatsman(0);
  }

  function handleWicket(e: React.MouseEvent<HTMLButtonElement>) {
    const event = e.currentTarget.value;

    const wicketType = JSON.parse(event);
    let eventToAdd;

    if (!wicketType.isOtherPlayerInvolved) {
      handleLastBallInWicket(event);
      // If second last player is out, don't show select batsman dialog
      if (!isSLastPlayer) setShowSelectBatsman(true);
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
    if (!isSLastPlayer) setShowSelectBatsman(true);
    handleLastBallInWicket("-1");
    handleScore({
      currentTarget: {
        value: `-1_${wicketTypeId}_${fielderId}_${runsAlongWithRunOut}`,
      },
    } as React.MouseEvent<HTMLButtonElement>);
  }

  function handleSave() {
    // Use this hack to get fresh events
    if (balls.length && !match.hasEnded) setCanSaveEvents(true);

    updateMutate({
      id: matchId,
      strikeIndex: onStrikeBatsman,
    });
  }

  function handleInningChange() {
    setCurPlayers([]);
    setShowSelectBatsman(true);
    setOnStrikeBatsman(0);
    setCurTeam(Number(!Boolean(curTeam)));
    updateMutate({
      id: matchId,
      curPlayers: [],
      curTeam: Number(!Boolean(match?.curTeam)),
    });
    handleSave();
  }

  function handleFinish() {
    setHasEnded(true);
    if (!match?.hasEnded) {
      setShowSelectBatsman(false);
      updateMutate({
        id: matchId,
        hasEnded: true,
      });
      toast.info("Match finished!");
    }
    handleSave();
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
    setCurTeam(0);
    updateMutate({
      id: matchId,
      curPlayers: [],
      curTeam: 0,
      strikeIndex: 0,
      ...(match?.hasEnded && { hasEnded: false }),
    });
    setOnStrikeBatsman(0);

    setShowSelectBatsman(true);
    setCurPlayers([]);
  }

  return (
    <StatsOpenProvider>
      <Card className="relative max-sm:w-full max-sm:border-0 max-sm:shadow-none sm:w-96 sm:p-2">
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
            backLink="/matches"
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
          players={team.players}
          onStrikeBatsman={onStrikeBatsman}
          playerIds={curBatsmenIds}
          events={events as BallEvent[]}
        />
        <div className="my-2 md:my-4" />
        <BowlerScores
          player={opposingTeam.players.find(
            (player) => curBowlerId === player.id,
          )}
          events={events as BallEvent[]}
        />
        <Separator className="my-3" />
        <ScoreButtons handleScore={handleScore} handleWicket={handleWicket} />
        {/* {!isUpdatingMatch && !isPending ? (
        ) : (
          <ScoreButtonsSkeleton />
        )} */}
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
        {!hasEnded && (
          <SelectBatsman
            open={showSelectBatsman}
            setOpen={setShowSelectBatsman}
            curPlayers={curPlayers}
            events={events}
            team={{ name: team?.name, players: team?.players }}
            handleUndo={() => {
              handleUndo();
              setCurPlayers(match?.curPlayers || []);
              setShowSelectBatsman(false);
            }}
            handleSelectPlayer={handleSelectPlayer}
            allowSinglePlayer={match?.allowSinglePlayer}
          />
        )}
        {!hasEnded && (
          <SelectBowler
            open={showSelectBowler}
            setOpen={setShowSelectBowler}
            curPlayers={curPlayers}
            handleSelectPlayer={handleSelectPlayer}
            team={{ name: opposingTeam?.name, players: opposingTeam?.players }}
            handleUndo={() => {
              handleUndo();
              setShowSelectBowler(false);
            }}
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
          open={hasEnded}
          setShowScorecard={setShowScorecard}
          match={match}
          handleUndo={() => {
            setHasEnded(false);
            handleUndo();
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
