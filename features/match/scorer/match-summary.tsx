import { Dispatch, SetStateAction } from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { BallEvent } from "@prisma/client";

import { useStatsOpenContext } from "@/contexts/stats-open-context";
import {
  calcBestPerformance,
  calculateWinner,
  cn,
  getIsNotOut,
  getOverStr,
  getScore,
  abbreviateEntity,
  calculateMaidenOvers,
} from "@/lib/utils";
import { CreateBallEventSchema } from "@/lib/validation/ball-event";
import {
  EventType,
  MatchExtended,
  OverlayStateProps,
  PlayerPerformance,
} from "@/types";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { TypographyH4 } from "@/components/ui/typography";

import TargetInfo from "./target-info";

interface MatchSummaryProps {
  open: OverlayStateProps["open"];
  setShowScorecard: Dispatch<SetStateAction<boolean>>;
  ballEvents: BallEvent[] | CreateBallEventSchema[];
  handleUndo: () => void;
  match: MatchExtended | undefined;
  playerIds: string[];
  hasEnded: boolean;
}

function MatchSummary({
  open,
  setShowScorecard,
  ballEvents,
  handleUndo,
  match,
  playerIds,
  hasEnded: hasEndedState,
}: MatchSummaryProps) {
  const hasEnded = hasEndedState || match?.hasEnded;
  const searchParams = useSearchParams();
  const userRef = searchParams.get("user");

  const opponentEvents = ballEvents?.filter((event) =>
    playerIds.includes(event.bowlerId),
  );

  const { setShowRunrateChart, setShowOverSummaries, setShowWormChart } =
    useStatsOpenContext();

  const { allowSinglePlayer, overs } = match || {
    allowSinglePlayer: false,
    overs: 0,
  };
  const matchBalls = overs * 6;

  const groupedEvents: Record<
    string,
    {
      playerId: string;
      batType: string[];
      bowlType: string[];
      fieldType: string[];
    }
  > = {};

  ballEvents.forEach((event) => {
    const { batsmanId, bowlerId, type } = event;

    if (!groupedEvents[batsmanId]) {
      groupedEvents[batsmanId] = {
        playerId: batsmanId,
        batType: [type],
        bowlType: [],
        fieldType: [],
      };
    } else groupedEvents[batsmanId].batType.push(type);

    if (!groupedEvents[bowlerId]) {
      groupedEvents[bowlerId] = {
        playerId: bowlerId,
        batType: [],
        bowlType: [type],
        fieldType: [],
      };
    } else groupedEvents[bowlerId].bowlType.push(type);

    if (
      type === "-1_4" ||
      type.includes("_3_") ||
      type.includes("_5_" || type.includes("_6_"))
    ) {
      let fielderId;

      if (type === "-1_4") fielderId = bowlerId;
      else fielderId = type.split("_")[2];

      if (!groupedEvents[fielderId]) {
        groupedEvents[fielderId] = {
          playerId: fielderId,
          batType: [],
          bowlType: [],
          fieldType: [type],
        };
      } else groupedEvents[fielderId].fieldType.push(type);
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

  const { runs: runs1 } = getScore({ balls: ballEventsbyTeam(0) });
  const {
    runs: runs2,
    wickets: wickets2,
    totalBalls,
  } = getScore({
    balls: ballEventsbyTeam(1),
  });
  const totalWickets = teams[1]?.playerIds?.length ?? 0;

  const { winInfo, winner } = hasEnded
    ? calculateWinner({
        allowSinglePlayer,
        matchBalls,
        runs1,
        runs2,
        teams: teams.map(({ name }) => name ?? ""),
        totalBalls,
        totalWickets,
        wickets2,
      })
    : { winInfo: "Match in progress", winner: 0 };

  const playersPerformance: PlayerPerformance[] = Object.values(
    groupedEvents,
  ).map(({ playerId, batType, bowlType, fieldType }) => {
    const {
      runs: runsScored,
      totalBalls: ballsFaced,
      wickets: outs,
      runRate,
    } = getScore({
      balls: batType,
      forBatsman: true,
    });
    const {
      runs: runConceded,
      wickets: wicketsTaken,
      totalBalls: ballsBowled,
      runRate: economy,
    } = getScore({
      balls: bowlType,
      forBowler: true,
    });

    const strikeRate = (runRate / 6) * 100;
    const noWicketEvents = batType.filter((event) => !event.includes("-1"));

    const boundaries = runsScored
      ? noWicketEvents.filter(
          (event) => event.includes("4") || event.includes("6"),
        )
      : [];

    const maidens = calculateMaidenOvers(bowlType as EventType[]);

    const fours = boundaries.filter((event) => event.includes("4")).length;
    const sixes = boundaries.filter((event) => event.includes("6")).length;
    const is30 = runsScored >= 30 && runsScored < 50;
    const is50 = runsScored >= 50 && runsScored < 100;
    const is100 = runsScored >= 100;
    const isDuck = runsScored === 0 && outs === 1;

    const is2 = wicketsTaken === 2;
    const is3 = wicketsTaken >= 3;

    const catches = fieldType.filter(
      (type) => type.includes("_3_") || type === "-1_4",
    ).length;
    const runOuts = fieldType.filter((type) => type.includes("_5_")).length;
    const stumpings = fieldType.filter((type) => type.includes("_6_")).length;

    return {
      playerId,
      runsScored,
      runConceded,
      wicketsTaken,
      ballsFaced,
      ballsBowled,
      catches,
      runOuts,
      stumpings,
      maidens,
      strikeRate,
      economy,
      fours,
      sixes,
      thirties: is30 ? 1 : 0,
      fifties: is50 ? 1 : 0,
      centuries: is100 ? 1 : 0,
      isDuck,
      is2,
      is3,
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

  const topPerformants = [
    ...getTopPerformants(teams[0].name ?? "", "batsman", 3),
    ...getTopPerformants(teams[1].name ?? "", "batsman", 3),
    ...getTopPerformants(teams[0].name ?? "", "bowler", 3),
    ...getTopPerformants(teams[1].name ?? "", "bowler", 3),
  ];

  function getTopPerformants(
    teamName: string,
    type: "batsman" | "bowler",
    count: number,
  ) {
    return playersPerformance
      .filter(
        (player) =>
          player.team === teamName &&
          player[type === "batsman" ? "ballsFaced" : "ballsBowled"],
      )
      .sort((a, b) => {
        const aEconomy = type === "bowler" ? a.runConceded / a.ballsBowled : 0;
        const bEconomy = type === "bowler" ? b.runConceded / b.ballsBowled : 0;
        return type === "batsman"
          ? b.runsScored - a.runsScored
          : b.wicketsTaken - a.wicketsTaken || aEconomy - bEconomy;
      })
      .slice(0, count)
      .map((player) => ({
        ...player,
        type,
        name: match?.teams
          .find((team) => team.name === teamName)
          ?.players.find(({ id }) => id === player.playerId)?.name,
      }));
  }

  const playerOfTheMatchData = hasEnded
    ? calcBestPerformance({
        playersPerformance,
      })[0]
    : null;

  const playerOfTheMatch = playerOfTheMatchData
    ? match?.teams
        .find((team) => team.name === playerOfTheMatchData.team)
        ?.players.find((player) => player.id === playerOfTheMatchData.playerId)
    : null;

  const playerOfTheMatchNotout = playerOfTheMatchData
    ? getIsNotOut({
        ballEvents: ballEvents as BallEvent[],
        playerId: playerOfTheMatchData.playerId,
      })
    : false;

  return (
    <Dialog open={open}>
      <DialogContent
        removeCloseButton
        className="max-h-[92%] overflow-y-auto overscroll-none"
      >
        <DialogHeader className="w-full flex-row items-center justify-between border-b pb-6">
          <DialogTitle>Match Summary</DialogTitle>

          {match && !userRef && (
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
                const { runs, totalBalls, wickets } = getScore({
                  balls: ballEventsbyTeam(i) || [],
                });

                return (
                  <div
                    key={team.name}
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
            {hasEnded ? (
              <p className="text-center font-medium">{winInfo}</p>
            ) : opponentEvents.length ? (
              <TargetInfo
                target={runs1 + 1}
                ballsRemaining={matchBalls - totalBalls}
                runs={runs2}
                curTeam={teams[1].name}
              />
            ) : (
              <p className="text-center font-medium">
                Waiting for opponent to start
              </p>
            )}
            {playerOfTheMatchData && (
              <>
                <Separator className="my-2" />
                <div className="rounded-md bg-muted p-2">
                  <h4 className="mb-1 text-xs font-bold uppercase text-muted-foreground">
                    Player of the Match
                  </h4>
                  <p>
                    <strong>{playerOfTheMatch?.name}</strong> (
                    {abbreviateEntity(playerOfTheMatchData.team)}) ·{" "}
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
              </>
            )}

            <ul className="space-y-2">
              {teams.map((team, i) => {
                const { runs, totalBalls, wickets } = getScore({
                  balls: ballEventsbyTeam(i) || [],
                });

                if (!totalBalls && !runs && !wickets)
                  return (
                    <div key={team.name}>
                      <span className="custom-divider text-sm">
                        {abbreviateEntity(team.name ?? "")} · {runs}/{wickets} (
                        {getOverStr(totalBalls)})
                      </span>
                      <p className="mt-2 text-center text-sm text-muted-foreground">
                        Yet to play
                      </p>
                    </div>
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
                  <div key={team.name}>
                    <span className="custom-divider text-sm">
                      {abbreviateEntity(team.name ?? "")} · {runs}/{wickets} (
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
              <Link href={`/matches${userRef ? `?user=${userRef} ` : ""}`}>
                Back & Finish
              </Link>
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default MatchSummary;
