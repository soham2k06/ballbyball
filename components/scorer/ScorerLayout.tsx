"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { BallEvent, CurPlayer } from "@prisma/client";
import { toast } from "sonner";
import { FileSearch } from "lucide-react";

import { EventType } from "@/types";

import { StatsOpenProvider } from "@/contexts/StatsOpenContext";

import { calcRuns, generateOverSummary, getScore } from "@/lib/utils";
import { strikeChangers } from "@/lib/constants";
import { CreateBallEventSchema } from "@/lib/validation/ballEvent";

import {
  useDeleteAllBallEvents,
  useSaveBallEvents,
} from "@/apiHooks/ballEvent/";
import { useMatchById } from "@/apiHooks/match";
import { useUpdateMatch } from "@/apiHooks/match";

import { Card, CardContent } from "@/components/ui/card";
import LoadingButton from "@/components/ui/loading-button";
import { Separator } from "@/components/ui/separator";
import { TypographyH4 } from "@/components/ui/typography";

import { SelectBatsman, SelectBowler } from "@/components/players-selection";

import DangerActions from "./DangerActions";
import ScoreDisplay from "./ScoreDisplay";
import BallSummary from "./BallSummary";
import ScoreButtons from "./ScoreButtons";
import BowlerScores from "./BowlerScores";
import BatsmanScores from "./BatsmanScores";
import Tools from "./Tools";
import FieldersDialog from "./FieldersDialog";
import MatchSummary from "./MatchSummary";
import { Button } from "../ui/button";

function ScorerLayout({ matchId }: { matchId: string }) {
  const { match, matchIsLoading, matchIsFetching, isSuccess } =
    useMatchById(matchId);

  const ballEventsFromMatch = match?.ballEvents;

  const team = match?.teams[match?.curTeam];
  const opposingTeam = match?.teams[match?.curTeam === 0 ? 1 : 0];

  const teamPlayerIds = team?.players.map((player) => player.id);

  // ** React query hooks
  const { createBallEvent, isPending } = useSaveBallEvents();
  const { updateMatch } = useUpdateMatch();
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
  useEffect(() => {
    if (ballEventsFromMatch?.length) {
      setEvents(ballEventsFromMatch as BallEvent[]);
    }
  }, [ballEventsFromMatch]);

  useEffect(() => {
    if (match?.strikeIndex) {
      setOnStrikeBatsman(match.strikeIndex || 0);
    }
  }, [match?.strikeIndex]);

  useEffect(() => {
    if (match?.curPlayers) setCurPlayers(match.curPlayers);
  }, [match?.curPlayers]);

  useEffect(() => {
    const isLastBallOfOver = totalBalls % 6 === 0 && totalBalls > 0;
    if (
      isLastBallOfOver &&
      curPlayers.filter((player) => player.type === "batsman").length === 2
    )
      changeStrike();
  }, [totalBalls]);

  // Handling after last ball
  useEffect(() => {
    const matchBalls = (match?.overs || 0) * 6;
    const isLastBallOfOver = totalBalls % 6 === 0 && totalBalls > 0;

    const isAllOut =
      wickets ===
      (team?.players.length || 0) - (match?.allowSinglePlayer ? 0 : 1);

    let isInSecondInning = false;

    if (isAllOut) {
      toast.info("All out!");
      setShowScorecard(true);

      if (isInSecondInning) handleFinish();
      else handleInningChange();
    }

    if (isLastBallOfOver) {
      if (matchBalls !== totalBalls) setShowSelectBowler(true);

      // Check if inning is finished
      if (totalBalls === matchBalls && totalBalls) {
        const playerIds = new Set(teamPlayerIds);
        for (const event of events) {
          if (!playerIds?.has(event.batsmanId)) {
            isInSecondInning = true;
            break;
          }
        }

        if (!isInSecondInning) {
          updateMatch({
            id: matchId,
            curTeam: Number(!Boolean(match?.curTeam)),
          });
          handleInningChange();
        } else handleFinish();
      }
    }
  }, [totalBalls]);

  // Handling Succesfull Chase
  useEffect(() => {
    const remainingRuns = opponentRuns - runs + 1;
    console.log({ remainingRuns, opponentRuns, runs });
    if (!opponentEvents.length) return;
    if (remainingRuns <= 0) handleFinish();
  }, [runs, opponentRuns]);

  // Handling initial player selection
  useEffect(() => {
    if (isSuccess) {
      const getHasPlayer = (type: "batsman" | "bowler") =>
        (curPlayers.length ? curPlayers : match?.curPlayers)?.some(
          (player) => player.type === type,
        );

      const hasBatsman = getHasPlayer("batsman");
      if (!hasBatsman) setShowSelectBatsman((prev) => prev || true);

      const hasBowler = getHasPlayer("bowler");
      if (!hasBowler) setShowSelectBowler(!hasBowler && !showSelectBatsman);
    }
  }, [showSelectBatsman, isSuccess]);

  if (matchIsLoading) return <p>loading...</p>;
  if (!match && !matchIsLoading)
    return (
      <div className="flex items-center justify-center py-4 md:p-8">
        <div className="flex flex-col gap-4">
          <div className="mx-auto inline-flex size-20 items-center justify-center rounded-full bg-muted shadow-sm">
            <FileSearch className="size-10" />
          </div>
          <div>
            <h2 className="pb-1 text-center text-base font-semibold leading-relaxed">
              Match not found
            </h2>
            <p className="pb-4 text-center text-sm font-normal leading-snug text-muted-foreground">
              Try searching for another match
            </p>
          </div>
          <Button asChild>
            <Link href="/matches">Back to matches</Link>
          </Button>
        </div>
      </div>
    );

  if (!match) return null;

  // ** Over Summary
  const { overSummaries, ballLimitInOver } = generateOverSummary(balls);

  const chartSummaryData = overSummaries.map((summary, i) => ({
    name: i < 9 ? `Over ${i + 1}` : i + 1,
    runs: calcRuns(summary),
  }));

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
    updateMatch(
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
      (event.includes("-3") ? event.slice(-1) : event) as EventType,
    );
  }

  function handleWicket(e: React.MouseEvent<HTMLButtonElement>) {
    const event = e.currentTarget.value;

    const wicketType = JSON.parse(event);
    let eventToAdd;

    if (!wicketType.isOtherPlayerInvolved) {
      setShowSelectBatsman(true);
      switch (wicketType.id) {
        case 1:
          eventToAdd = "-1";
          break;
        case 2:
          eventToAdd = "-1_2";
          break;
        case 4:
          eventToAdd = "-1_4";
          break;
      }

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

    updateMatch({
      id: matchId,
      strikeIndex: onStrikeBatsman,
    });
  }

  function handleInningChange() {
    setCurPlayers([]);
    setShowSelectBatsman(true);
    setOnStrikeBatsman(0);
    updateMatch({
      id: matchId,
      curPlayers: [],
      curTeam: Number(!Boolean(match?.curTeam)),
    });
    handleSave(0);
  }

  function handleFinish() {
    setShowMatchSummary(true);
    updateMatch({
      id: matchId,
      curPlayers: [],
      curTeam: Number(!Boolean(match?.curTeam)),
    });
    toast.info("Match finished!");
    handleSave(0);
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
    deleteAllBallEvents(matchId);
    setEvents([]);
    updateMatch({
      id: matchId,
      curPlayers: [],
      curTeam: 0,
    });
    setOnStrikeBatsman(0);

    setShowSelectBatsman(true);
    setCurPlayers([]);
  }

  return (
    <StatsOpenProvider>
      <Card className="relative p-2 max-sm:w-full max-sm:border-0 sm:w-96">
        <div className="absolute left-0 top-0 flex w-full items-center justify-between p-2">
          <div>
            <LoadingButton
              loading={isPending}
              disabled={isPending || !isModified}
              onClick={handleSave}
            >
              {isPending || matchIsFetching ? "Saving..." : "Save"}
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
          {!!opponentEvents.length && (
            <>
              <p>{opponentRuns - runs + 1} remaining</p>
            </>
          )}

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
            match={match}
            showScorecard={showScorecard}
            setShowScorecard={setShowScorecard}
          />
        </CardContent>
        <Separator className="my-4 sm:my-4" />
        <ScoreButtons handleScore={handleScore} handleWicket={handleWicket} />
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
        />
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
        />

        <FieldersDialog
          wicketTypeId={wicketTypeId}
          setWicketTypeId={setWicketTypeId}
          fielders={opposingTeam?.players}
          handleScore={handleWicketWithFielder}
        />
        <MatchSummary
          teams={[
            {
              name: match.teams[0].name,
              playerIds: match.teams[0].players.map(({ id }) => id),
            },
            {
              name: match.teams[1].name,
              playerIds: match.teams[1].players.map(({ id }) => id),
            },
          ]}
          allowSinglePlayer={match.allowSinglePlayer}
          ballEvents={events}
          open={showMatchSummary}
          setShowScorecard={setShowScorecard}
          handleUndo={() => {
            handleUndo();
            setShowMatchSummary(false);
          }}
        />
      </Card>
    </StatsOpenProvider>
  );
}

export default ScorerLayout;
