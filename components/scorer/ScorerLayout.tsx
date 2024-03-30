"use client";

import { useEffect, useState } from "react";

import { BallEvent, CurPlayer } from "@prisma/client";
import { toast } from "sonner";

import { EventType } from "@/types";

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
import { StatsOpenProvider } from "@/contexts/StatsOpenContext";

function ScorerLayout({ matchId }: { matchId: string }) {
  const { match } = useMatchById(matchId);

  const ballEventsFromMatch = match?.ballEvents;

  const team = match?.teams[match?.curTeam];

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

  const [showScorecard, setShowScorecard] = useState(false);
  const [showMatchSummary, setShowMatchSummary] = useState(false);

  const playerIds = team?.players.map((player) => player.id) || [];

  const balls = events
    ?.filter((event) => playerIds.includes(event.batsmanId))
    .map((event) => event.type as EventType);

  const [isBowlerSelected, setIsBowlerSelected] = useState(true);

  const changeStrike = () => setOnStrikeBatsman((prev) => (prev === 0 ? 1 : 0));

  const [wicketTypeId, setWicketTypeId] = useState<string | null>(null);

  const { runs, totalBalls, wickets, runRate } = getScore(balls || []);

  const opponentRuns = calcRuns(
    events
      ?.filter((event) => playerIds.includes(event.bowlerId))
      .map((event) => event.type as EventType),
  );

  // ** Effects
  useEffect(() => {
    setEvents(ballEventsFromMatch as BallEvent[]);
  }, [ballEventsFromMatch]);

  useEffect(() => {
    if (match?.curPlayers) setCurPlayers(match.curPlayers);
  }, [match?.curPlayers]);

  useEffect(() => {
    const isLastBallOfOver = totalBalls % 6 === 0 && totalBalls > 0;
    if (isLastBallOfOver) changeStrike();
  }, [totalBalls]);

  // Handling after last ball
  useEffect(() => {
    const matchBalls = (match?.overs || 0) * 6;
    const isLastBallOfOver = totalBalls % 6 === 0 && totalBalls > 0;

    const isAllOut = wickets === team?.players.length;
    let isInSecondInning = false;

    if (isAllOut) {
      toast.info("All out!");
      setShowScorecard(true);

      if (isInSecondInning) {
        setShowMatchSummary(true);
        udpateMatch({
          id: matchId,
          curPlayers: [],
          curTeam: Number(!Boolean(match?.curTeam)),
        });
      }
    }

    if (isLastBallOfOver) {
      if (matchBalls !== totalBalls) setIsBowlerSelected(false);

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
          handleSave(0, [], Number(!Boolean(match?.curTeam)));
        } else {
          toast.info("Match finished!");
          handleSave(0, match?.curPlayers);
        }
        setShowMatchSummary(true);
        setShowMatchSummary(true);
      }
    }
  }, [totalBalls]);

  if (!ballEventsFromMatch || !balls) return <p>loading...</p>;

  const showSelectBatsman =
    !curPlayers.filter((player) => player.type === "batsman").length &&
    !showScorecard;

  const showSelectBowler =
    ((!curPlayers.find((player) => player.type === "bowler") &&
      !showSelectBatsman) ||
      !isBowlerSelected) &&
    !showScorecard;

  // ** Over Summary
  let ballLimitInOver = 6;

  const overSummaries = generateOverSummary({
    ballEvents: balls,
    ballLimitInOver,
  }) as EventType[][];

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

  function handleSave(
    _: unknown,
    updatedCurPlayers?: CurPlayer[],
    curTeam?: number,
    dontSaveBallEvents?: boolean,
  ) {
    if (!dontSaveBallEvents && balls.length)
      createBallEvent(events as CreateBallEventSchema[], {
        onSuccess: () => {
          setIsModified(false);
          toast.success(
            !!updatedCurPlayers
              ? "Score auto saved"
              : "Score saved successfully",
          );
        },
      });

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
      switch (wicketType.id) {
        case 1:
          eventToAdd = "-1";
          break;
        case 2:
          eventToAdd = "-1_2";
        case 4:
          eventToAdd = "-1_4";
          break;
      }
      handleScore({
        currentTarget: { value: eventToAdd },
      } as React.MouseEvent<HTMLButtonElement>);
    } else setWicketTypeId(wicketType.id);
  }

  function handleScoreWithFielder(
    wicketTypeId: number,
    fielderId: string,
    runsAlongWithRunOut?: number,
  ) {
    handleScore({
      currentTarget: {
        value: `-1_${wicketTypeId}_${fielderId}_${runsAlongWithRunOut}`,
      },
    } as React.MouseEvent<HTMLButtonElement>);
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
    <StatsOpenProvider>
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
        <FieldersDialog
          wicketTypeId={wicketTypeId}
          setWicketTypeId={setWicketTypeId}
          fielders={match.teams[match.curTeam === 0 ? 1 : 0].players}
          handleScore={handleScoreWithFielder}
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
          ballEvents={events}
          totalPlayers={
            (match.teams[0].players.length + match.teams[1].players.length) / 2
          }
          open={showMatchSummary}
          isSecondInning={
            !new Set(team?.players.map((player) => player.id)).has(
              events[0]?.batsmanId,
            )
          }
          setOpen={setShowMatchSummary}
          setShowScorecard={setShowScorecard}
        />
      </Card>
    </StatsOpenProvider>
  );
}

export default ScorerLayout;
