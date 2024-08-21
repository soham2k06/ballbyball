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
  getIsNotOut,
  getOverStr,
  getScore,
  processTeamName,
} from "@/lib/utils";
import { BallEvent } from "@prisma/client";
import { CreateBallEventSchema } from "@/lib/validation/ballEvent";
import { TypographyH4 } from "../ui/typography";

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

  const topPerformants = playersPerformance
    .filter((player) => player.team === teams[0].name && player.ballsFaced)
    .sort((a, b) => b.runsScored - a.runsScored)
    .slice(0, 2)
    .map((player) => ({
      ...player,
      type: "batsman",
      name: match?.teams[0].players.find(({ id }) => id === player.playerId)
        ?.name,
    }))
    .concat(
      playersPerformance
        .filter((player) => player.team === teams[1].name && player.ballsFaced)
        .sort((a, b) => b.runsScored - a.runsScored)
        .slice(0, 2)
        .map((player) => ({
          ...player,
          type: "batsman",
          name: match?.teams[1].players.find(({ id }) => id === player.playerId)
            ?.name,
        })),
    )
    .concat(
      playersPerformance
        .filter((player) => player.team === teams[0].name && player.ballsBowled)
        .sort((a, b) => b.wicketsTaken - a.wicketsTaken)
        .slice(0, 2)
        .map((player) => ({
          ...player,
          type: "bowler",
          name: match?.teams[0].players.find(({ id }) => id === player.playerId)
            ?.name,
        })),
    )
    .concat(
      playersPerformance
        .filter((player) => player.team === teams[1].name && player.ballsBowled)
        .sort((a, b) => b.wicketsTaken - a.wicketsTaken)
        .slice(0, 2)
        .map((player) => ({
          ...player,
          type: "bowler",
          name: match?.teams[1].players.find(({ id }) => id === player.playerId)
            ?.name,
        })),
    );

  const playerOfTheMatchData = calculatePlayerOfTheMatch({
    playersPerformance,
  });

  const playerOfTheMatch = match?.teams
    .find((team) => team.name === playerOfTheMatchData.team)
    ?.players.find((player) => player.id === playerOfTheMatchData.playerId);

  const playerOfTheMatchNotout = getIsNotOut({
    ballEvents: ballEvents as BallEvent[],
    playerId: playerOfTheMatchData.playerId,
  });

  return (
    <Dialog open={open}>
      <DialogContent
        removeCloseButton
        className="max-h-[92%] overflow-y-auto overscroll-none"
      >
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
              <p>
                <strong>{playerOfTheMatch?.name}</strong> (
                {processTeamName(playerOfTheMatchData.team)}) ·{" "}
                {!!playerOfTheMatchData.ballsBowled && (
                  <>
                    {" "}
                    {playerOfTheMatchData.wicketsTaken}/
                    {playerOfTheMatchData.runConceded} (
                    {getOverStr(playerOfTheMatchData.ballsBowled)})
                  </>
                )}
                {!!playerOfTheMatchData.ballsBowled &&
                  !!playerOfTheMatchData.ballsFaced &&
                  " & "}
                {playerOfTheMatchData.ballsFaced && (
                  <>
                    {playerOfTheMatchData.runsScored}
                    {playerOfTheMatchNotout && "*"} (
                    {playerOfTheMatchData.ballsFaced})
                  </>
                )}
              </p>
            </div>

            <ul className="space-y-2">
              {teams.map((team, i) => {
                const { runs, totalBalls, wickets } = getScore(
                  ballEventsbyTeam(i) || [],
                );

                const topBatsmen = (topPerformants ?? [])
                  .filter(
                    (player) =>
                      player.team === team.name && player.type === "batsman",
                  )
                  .map((player) => ({
                    ...player,
                    isNotOut: getIsNotOut({
                      ballEvents: ballEvents as BallEvent[],
                      playerId: player.playerId,
                    }),
                  }));

                const topBowlers = (topPerformants ?? []).filter(
                  (player) =>
                    player.team !== team.name && player.type === "bowler",
                );

                return (
                  <div>
                    <span className="custom-divider text-sm">
                      {processTeamName(team.name ?? "")} · {runs}/{wickets} (
                      {getOverStr(totalBalls)})
                    </span>
                    <div className="flex justify-between">
                      <ul className="space-y-2">
                        {topBatsmen.map((player) => (
                          <li key={player.playerId}>
                            <h4>{player.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {player.runsScored}
                              {player.isNotOut && "*"} ({player.ballsFaced})
                            </p>
                          </li>
                        ))}
                      </ul>
                      <ul className="space-y-2 text-right">
                        {topBowlers.map((player) => (
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
