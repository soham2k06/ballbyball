import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OverlayStateProps, PlayerPerformance } from "@/types";
import { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { useStatsOpenContext } from "@/contexts/StatsOpenContext";
import { Separator } from "../ui/separator";
import {
  calculatePlayerOfTheMatch,
  getOverStr,
  getScore,
  processTeamName,
} from "@/lib/utils";
import { BallEvent } from "@prisma/client";
import { CreateBallEventSchema } from "@/lib/validation/ballEvent";
import { usePlayerById } from "@/apiHooks/player";

interface MatchSummaryProps extends OverlayStateProps {
  setShowScorecard: Dispatch<SetStateAction<boolean>>;

  teams: { name: string; playerIds: string[] }[];
  ballEvents: BallEvent[] | CreateBallEventSchema[];
  isSecondInning: boolean;
  totalPlayers: number;
}

function MatchSummary({
  open,
  setOpen,
  isSecondInning,
  setShowScorecard,
  teams,
  totalPlayers,
  ballEvents,
}: MatchSummaryProps) {
  const { setShowRunrateChart, setShowOverSummaries } = useStatsOpenContext();

  const ballEventsbyTeam = (i: number) =>
    ballEvents
      .filter((event) => teams[i].playerIds.includes(event.batsmanId))
      .map((event) => event.type);

  const { runs: runs1 } = getScore(ballEventsbyTeam(0));
  const { runs: runs2, wickets: wickets2 } = getScore(ballEventsbyTeam(1));
  const totalWickets = teams[1].playerIds.length;

  function calculateWinner(
    runs1: number,
    runs2: number,
    wickets2: number,
    totalWickets: number,
  ) {
    let winInfo = "";
    let winner;
    if (runs1 > runs2) {
      winInfo = `${processTeamName(teams[0].name)} won by ${runs1 - runs2} runs`;
      winner = 0;
    } else if (runs2 > runs1) {
      winInfo = `${processTeamName(teams[1].name)} won by ${totalWickets - wickets2} wickets`;
      winner = 1;
    } else {
      winInfo =
        "Match Tied (Sorry for the inconvenience but we don't have super over feature yet)";
      winner = -1;
    }

    return {
      winInfo,
      winner,
    };
  }
  const { winInfo } = calculateWinner(runs1, runs2, wickets2, totalWickets);

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

  const playersPerformance: PlayerPerformance[] = Object.values(
    groupedEvents,
  ).map(({ playerId, batType, bowlType }) => {
    const { runs: runsScored, totalBalls: ballsFaced } = getScore(batType);
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
        teams.find(({ playerIds }) =>
          playerIds.includes(playerId) ? playerIds : null,
        )?.name ?? "Loading...",
    };
  });

  const playerOfTheMatch = calculatePlayerOfTheMatch({
    playersPerformance,
    totalOpponentPlayers: totalPlayers,
  });

  const { player } = usePlayerById(playerOfTheMatch.playerId);

  return (
    <Dialog open={open}>
      <DialogContent removeCloseButton>
        <DialogHeader className="w-fit border-b pb-6">
          <DialogTitle>Match Summary</DialogTitle>
        </DialogHeader>

        {isSecondInning && (
          <>
            <div className="rounded-md bg-muted p-2">
              <h4 className="mb-1 text-xs font-bold uppercase text-muted-foreground">
                Player of the Match
              </h4>
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
                {!!playerOfTheMatch.ballsFaced && (
                  <>
                    {playerOfTheMatch.runConceded} (
                    {playerOfTheMatch.ballsBowled})
                  </>
                )}
              </p>
            </div>
            <Separator className="my-2" />
          </>
        )}
        <div className="space-y-2">
          {teams.map((team, i) => {
            const { runs, totalBalls, wickets } = getScore(
              ballEventsbyTeam(i) || [],
            );

            return (
              <div key={i} className="flex items-center justify-between">
                <h4 className="text-lg font-semibold">
                  {processTeamName(team.name)}
                </h4>
                <p>
                  {runs}/{wickets} ({getOverStr(totalBalls)})
                </p>
              </div>
            );
          })}
        </div>
        {isSecondInning && <p>{winInfo}</p>}
        <Separator className="my-2" />
        <div className="flex gap-2">
          <Button onClick={() => setShowScorecard(true)} className="w-full">
            Scorecard
          </Button>
          <Button onClick={() => setShowRunrateChart(true)} className="w-full">
            Run rate chart
          </Button>
          <Button onClick={() => setShowOverSummaries(true)} className="w-full">
            Over summaries
          </Button>
        </div>
        <Separator className="my-2" />
        <Button className="w-full" asChild>
          {isSecondInning ? (
            <Link href="/matches">Back & Finish</Link>
          ) : (
            <Button onClick={() => setOpen(false)}>Back</Button>
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default MatchSummary;
