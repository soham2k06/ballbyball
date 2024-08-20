import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MatchExtended, OverlayStateProps, PlayerPerformance } from "@/types";
import { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { useStatsOpenContext } from "@/contexts/StatsOpenContext";
import { Separator } from "../ui/separator";
import {
  calculatePlayerOfTheMatch,
  calculateWinner,
  cn,
  getOverStr,
  getScore,
  processTeamName,
} from "@/lib/utils";
import { BallEvent } from "@prisma/client";
import { CreateBallEventSchema } from "@/lib/validation/ballEvent";
import { usePlayerById } from "@/apiHooks/player";
import { Skeleton } from "../ui/skeleton";
import { TypographyH4 } from "../ui/typography";
import { useTopPerformants } from "@/apiHooks/match/useTopPerformants";

interface MatchSummaryProps {
  open: OverlayStateProps["open"];
  setShowScorecard: Dispatch<SetStateAction<boolean>>;
  ballEvents: BallEvent[] | CreateBallEventSchema[];
  handleUndo: () => void;
  match: MatchExtended | undefined;
}

function MatchSummary({
  open,
  setShowScorecard,
  ballEvents,
  handleUndo,
  match,
}: MatchSummaryProps) {
  const { setShowRunrateChart, setShowOverSummaries, setShowWormChart } =
    useStatsOpenContext();

  const { allowSinglePlayer, overs } = match || {
    allowSinglePlayer: false,
    overs: 0,
  };
  const matchBalls = overs * 6;

  const groupedEvents: Record<
    string,
    { playerId: string; batType: string[]; bowlType: string[] }
  > = {};

  ballEvents.forEach((event) => {
    const { batsmanId, bowlerId, type } = event;

    if (!groupedEvents[batsmanId]) {
      groupedEvents[batsmanId] = {
        playerId: batsmanId,
        batType: [type],
        bowlType: [],
      };
    } else {
      groupedEvents[batsmanId].batType.push(type);
    }

    if (!groupedEvents[bowlerId]) {
      groupedEvents[bowlerId] = {
        playerId: bowlerId,
        batType: [],
        bowlType: [type],
      };
    } else {
      groupedEvents[bowlerId].bowlType.push(type);
    }
  });

  const teams = [
    {
      name: match?.teams[0].name,
      playerIds: match?.teams[0].players.map(({ id }) => id),
    },
    {
      name: match?.teams[1].name,
      playerIds: match?.teams[1].players.map(({ id }) => id),
    },
  ];

  const ballEventsbyTeam = (i: number) =>
    ballEvents
      .filter((event) => teams[i]?.playerIds?.includes(event.batsmanId))
      .map((event) => event.type);

  const { runs: runs1 } = getScore(ballEventsbyTeam(0));
  const {
    runs: runs2,
    wickets: wickets2,
    totalBalls,
  } = getScore(ballEventsbyTeam(1));
  const totalWickets = teams[1]?.playerIds?.length ?? 0;

  const { winInfo, winner } = calculateWinner({
    allowSinglePlayer,
    matchBalls,
    runs1,
    runs2,
    teams: teams.map(({ name }) => name ?? ""),
    totalBalls,
    totalWickets,
    wickets2,
  });

  const playersPerformance: PlayerPerformance[] = Object.values(
    groupedEvents,
  ).map(({ playerId, batType, bowlType }) => {
    const { runs: runsScored, totalBalls: ballsFaced } = getScore(
      batType,
      true,
    );
    const {
      runs: runConceded,
      wickets: wicketsTaken,
      totalBalls: ballsBowled,
    } = getScore(bowlType);

    return {
      playerId,
      runsScored,
      runConceded,
      wicketsTaken,
      ballsFaced,
      ballsBowled,
      team:
        match?.teams.find(
          ({ players }) =>
            players.map((player) => player.id).includes(playerId) ?? null,
        )?.name ?? "Loading...",
      isWinner: !!match?.teams[winner]?.players
        .map((player) => player.id)
        .includes(playerId),
    };
  });

  const { topPerformants, isLoading: isTopPerformantsLoading } =
    useTopPerformants({
      id: match?.id,
      payload: {
        playersPerformance,
        team1: teams[0].name ?? "",
        team2: teams[1].name ?? "",
      },
    });

  const playerOfTheMatch = calculatePlayerOfTheMatch({ playersPerformance });

  const { player, isLoading } = usePlayerById(playerOfTheMatch.playerId);

  return (
    <Dialog open={open}>
      <DialogContent removeCloseButton className="max-h-[92%] overflow-auto">
        <DialogHeader className="w-full flex-row items-center justify-between border-b pb-6">
          <DialogTitle>Match Summary</DialogTitle>

          {match && (
            <Button variant="destructive" onClick={handleUndo}>
              Undo
            </Button>
          )}
        </DialogHeader>

        {!match ? (
          <div className="flex h-96 items-center justify-center">
            <TypographyH4>Generating...</TypographyH4>
          </div>
        ) : (
          <>
            <div className="flex justify-between gap-2">
              {teams.map((team, i) => {
                const { runs, totalBalls, wickets } = getScore(
                  ballEventsbyTeam(i) || [],
                );

                return (
                  <div
                    key={i}
                    className={cn("flex flex-col justify-between", {
                      "items-end": i === 1,
                    })}
                  >
                    <h4 className="text-lg font-semibold">
                      {team?.name ?? ""}
                    </h4>
                    <p>
                      {runs}/{wickets} ({getOverStr(totalBalls)})
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="text-center font-medium">{winInfo}</p>
            <Separator className="my-2" />
            <div className="rounded-md bg-muted p-2">
              <h4 className="mb-1 text-xs font-bold uppercase text-muted-foreground">
                Player of the Match
              </h4>
              {!isLoading ? (
                <p>
                  <strong>{player?.name ?? "Loading..."}</strong> (
                  {processTeamName(playerOfTheMatch.team)}) ·{" "}
                  {!!playerOfTheMatch.ballsBowled && (
                    <>
                      {" "}
                      {playerOfTheMatch.wicketsTaken}/
                      {playerOfTheMatch.runConceded} (
                      {getOverStr(playerOfTheMatch.ballsBowled)})
                    </>
                  )}
                  {!!playerOfTheMatch.ballsBowled &&
                    !!playerOfTheMatch.ballsFaced &&
                    " & "}
                  {playerOfTheMatch.ballsFaced && (
                    <>
                      {playerOfTheMatch.runsScored} (
                      {playerOfTheMatch.ballsFaced})
                    </>
                  )}
                </p>
              ) : (
                <Skeleton className="h-6 w-48 bg-foreground/10" />
              )}
            </div>

            <ul className="space-y-2">
              {teams.map((team, i) => {
                const { runs, totalBalls, wickets } = getScore(
                  ballEventsbyTeam(i) || [],
                );

                const top2Batsmen = (topPerformants ?? []).filter(
                  (player) =>
                    player.team === team.name && player.type === "batsman",
                );

                const top2Bowlers = (topPerformants ?? []).filter(
                  (player) =>
                    player.team !== team.name && player.type === "bowler",
                );

                return (
                  <div>
                    <span className="custom-divider text-sm">
                      {processTeamName(team.name ?? "")} · {runs}/{wickets} (
                      {getOverStr(totalBalls)})
                    </span>
                    {isTopPerformantsLoading ? (
                      <Skeleton className="h-24 w-full" />
                    ) : (
                      <div className="flex justify-between">
                        <ul className="space-y-2">
                          {top2Batsmen.map((player) => (
                            <li key={player.playerId}>
                              <h4>{player.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {player.runsScored} ({player.ballsFaced})
                              </p>
                            </li>
                          ))}
                        </ul>
                        <ul className="space-y-2 text-right">
                          {top2Bowlers.map((player) => (
                            <li key={player.playerId}>
                              <h4>{player.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {player.wicketsTaken}/{player.runConceded} (
                                {getOverStr(player.ballsBowled)})
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })}
            </ul>

            <Separator className="my-2" />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setShowScorecard(true)}>
                Scorecard
              </Button>
              <Button size="sm" onClick={() => setShowRunrateChart(true)}>
                Run rate chart
              </Button>
              <Button size="sm" onClick={() => setShowWormChart(true)}>
                Worm Chart
              </Button>
              <Button size="sm" onClick={() => setShowOverSummaries(true)}>
                Over summaries
              </Button>
            </div>
            <Separator className="my-2" />
            <Button
              className="sticky bottom-0 w-full"
              asChild
              variant="secondary"
            >
              <Link href="/matches">Back & Finish</Link>
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default MatchSummary;
