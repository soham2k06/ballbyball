"use client";

import { useEffect, useState } from "react";

import { BallEvent, CurPlayer, Player } from "@prisma/client";
import { toast } from "sonner";

import { StatsOpenProvider } from "@/contexts/stats-open-context";
import { deleteAllBallEvents, saveBallEvents } from "@/lib/actions/ball-event";
import { updateMatch } from "@/lib/actions/match";
import { strikeChangers } from "@/lib/constants";
import { useActionMutate } from "@/lib/hooks";
import {
  calcRuns,
  generateOverSummary,
  getIsvalidBall,
  getScore,
} from "@/lib/utils";
import { CreateBallEventSchema } from "@/lib/validation/ball-event";
import { EventType, MatchExtended } from "@/types";

import {
  SelectBatsman,
  SelectBowler,
} from "@/features/match/players-selection";

import { Card, CardContent } from "@/components/ui/card";
import LoadingButton from "@/components/ui/loading-button";
import { Separator } from "@/components/ui/separator";

import BatsmanScores from "../player-scores/batsman";
import BowlerScores from "../player-scores/bowler";
import ScoreButtons from "../score-buttons";
import Tools from "../stats/tools";

import BallSummary from "./ball-summary";
import DangerActions from "./danger-actions";
import FieldersDialog from "./fielders-dialog";
import MatchSummary from "./match-summary";
import ScoreDisplay from "./score-display";
import TargetInfo from "./target-info";

function ScorerLayout({
  matchId,
  match,
  userRef,
}: {
  matchId: string;
  match: MatchExtended;
  userRef: string | null;
}) {
  // ** Action hooks
  const { mutate: createBallEvent, isPending } =
    useActionMutate(saveBallEvents);
  const { mutate: updateMutate } = useActionMutate(updateMatch);
  const { mutate: deleteAllBallEventsMutate } =
    useActionMutate(deleteAllBallEvents);

  // ** States
  const [hasEnded, setHasEnded] = useState(match.hasEnded);
  const [showMatchSummary, setShowMatchSummary] = useState(false);
  const [curTeam, setCurTeam] = useState(match?.curTeam ?? 0);
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

  const [showScorecard, setShowScorecard] = useState(false);

  const team = match?.teams[curTeam];
  const opposingTeam = match?.teams[curTeam === 0 ? 1 : 0];
  const playerIds = team?.players.map((player) => player.id) || [];

  const isInSecondInning = curTeam === 1;

  const curBowlerId = curPlayers.find((player) => player.type === "bowler")?.id;
  // filter if out
  const curBatsmenIds = curPlayers
    .filter((player) => player.type === "batsman")
    .map((player) => player.id);

  const curBatsmen = curBatsmenIds
    .map((id) => team.players.find((player) => player.id === id))
    .filter((player) => player !== undefined);

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
    if (userRef) return;
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
    if (userRef) return;
    const isLastBallOfOver = totalBalls % 6 === 0 && totalBalls > 0;
    if (isLastBallOfOver && curBatsmenIds.length === 2) changeStrike();
  }, [totalBalls]);

  // Handling Succesfull Chase
  useEffect(() => {
    if (userRef) return;
    const remainingRuns = opponentRuns - runs + 1;
    if (!opponentEvents.length) return;
    if (remainingRuns <= 0) handleFinish();
  }, [runs, opponentRuns]);

  // Handling All out win
  useEffect(() => {
    if (userRef) return;
    const isAllOut =
      wickets ===
      (team?.players.length || 0) - (match?.allowSinglePlayer ? 0 : 1);

    if (isAllOut) {
      if (isInSecondInning || match.hasEnded) handleFinish();
      else {
        toast.info("All out!");
        handleInningChange();
      }
    }
  }, [wickets, hasEnded]);

  // Handle last ball of over & inning change
  useEffect(() => {
    if (userRef) return;
    const matchBalls = (match?.overs || 0) * 6;
    const isLastBallOfOver = totalBalls % 6 === 0 && totalBalls > 0;

    if (isLastBallOfOver) {
      if (matchBalls !== totalBalls) setShowSelectBowler(true);

      // Check if inning is finished
      if (totalBalls === matchBalls) {
        if (isInSecondInning || hasEnded) handleFinish();
        else handleInningChange();
      }
    }
  }, [totalBalls]);

  useEffect(() => {
    if (userRef) setShowMatchSummary(true);
  }, [userRef]);

  // ** Over Summary
  const { overSummaries, ballLimitInOver } = !userRef
    ? generateOverSummary(balls)
    : { overSummaries: [], ballLimitInOver: 6 };

  const curOverIndex = Math.floor(totalBalls / 6);

  // ** Handlers
  function handleStrikeChange(ballEventType: EventType) {
    if (strikeChangers.includes(ballEventType)) changeStrike();
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

  function handleScore(
    e: React.MouseEvent<HTMLButtonElement>,
    customBatsman?: string,
  ) {
    setIsModified(true);

    const event = e.currentTarget.value;

    const batsman = customBatsman ?? curPlayers[onStrikeBatsman].id;

    if (event !== "-4")
      setEvents([
        ...events,
        {
          type: event,
          batsmanId: batsman,
          bowlerId: curBowlerId,
          matchId,
        },
      ] as CreateBallEventSchema[]);

    if (event.includes("-1")) {
      const updatedPlayers = curPlayers.filter(
        (player) => player.id !== batsman,
      );
      setCurPlayers(updatedPlayers as CurPlayer[]);
    }

    const strikeEvent = !event.includes("-1") ? event : event.slice(0, -2);
    if (curBatsmen.length === 2)
      handleStrikeChange((event === "-4" ? "-4" : strikeEvent) as EventType);
    else handleStrikeChange((event === "-4" ? "-4" : "0") as EventType);
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

  function handleWicketWithFielder({
    fielderId,
    wicketTypeId,
    customBatsman,
    runsAlongWithRunOut,
  }: {
    wicketTypeId: number;
    fielderId: string;
    runsAlongWithRunOut?: number;
    customBatsman?: string;
  }) {
    if (!isSLastPlayer) setShowSelectBatsman(true);
    handleLastBallInWicket("-1");
    handleScore(
      {
        currentTarget: {
          value: `-1_${wicketTypeId}_${fielderId}_${runsAlongWithRunOut}`,
        },
      } as React.MouseEvent<HTMLButtonElement>,
      customBatsman,
    );
  }

  function handleSave() {
    if (events.length && !match.hasEnded)
      createBallEvent(
        events.map((event) => ({ ...event, matchId })),
        {
          onSuccess: () => {
            setIsModified(false);
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
    setCurTeam(Number(!Boolean(curTeam)));
    updateMutate({
      id: matchId,
      curPlayers: [],
      curTeam: Number(!Boolean(match?.curTeam)),
    });
    handleSave();
  }

  function handleFinish() {
    setShowMatchSummary(true);
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
      {!userRef ? (
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
              team={{
                name: opposingTeam?.name,
                players: opposingTeam?.players,
              }}
              handleUndo={() => {
                handleUndo();
                setShowSelectBowler(false);
              }}
            />
          )}

          <FieldersDialog
            curBatsmen={curBatsmen as Player[]}
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
            playerIds={playerIds}
            hasEnded={hasEnded}
            handleUndo={() => {
              setShowMatchSummary(false);
              setHasEnded(false);
              handleUndo();
              updateMutate({
                id: matchId,
                hasEnded: false,
              });
            }}
          />
        </Card>
      ) : (
        <>
          <MatchSummary
            ballEvents={events}
            open={showMatchSummary}
            setShowScorecard={setShowScorecard}
            match={match}
            playerIds={playerIds}
            handleUndo={() => {}}
            hasEnded={hasEnded}
          />
          <div className="hidden">
            <Tools
              curPlayers={curPlayers}
              setCurPlayers={setCurPlayers}
              events={events}
              match={match}
              showScorecard={showScorecard}
              setShowScorecard={setShowScorecard}
            />
          </div>
        </>
      )}
    </StatsOpenProvider>
  );
}

export default ScorerLayout;
