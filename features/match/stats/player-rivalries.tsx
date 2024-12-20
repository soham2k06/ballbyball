import { useState } from "react";

import { Player } from "@prisma/client";

import { wicketTypes } from "@/lib/constants";
import { getIsvalidBall, getScore } from "@/lib/utils";
import { RivalriesResult } from "@/types";

import RivalryCard from "@/features/rivalries/rivalry-card";

import { Dialog, DialogContent } from "@/components/ui/dialog";

type BallEventSemi = {
  batsmanId: string;
  bowlerId: string;
  type: string;
  matchId: string | null;
};

interface PlayerRivalriesProps {
  ballEvents: BallEventSemi[];
  players: Player[];
}

function getAllRivalries(
  events: BallEventSemi[],
  players: Player[],
): RivalriesResult[] {
  const rivalries: Record<string, RivalriesResult> = {};

  events.forEach((event) => {
    const { batsmanId, bowlerId, type } = event;
    const key = `${batsmanId}-${bowlerId}`;

    if (!rivalries[key]) {
      const batsmanName = players.find(
        (player) => player.id === batsmanId,
      )?.name;
      const bowlerName = players.find((player) => player.id === bowlerId)?.name;

      rivalries[key] = {
        batsmanId,
        bowlerId,
        batsman: batsmanName ?? "Unknown",
        bowler: bowlerName ?? "Unknown",
        wickets: 0,
        strikeRate: 0,
        runs: 0,
        balls: 0,
        dots: 0,
        boundaries: 0,
        weight: 0,
        matches: 0,
        dominance: [0, 0],
        recentBalls: [],
      };
    }

    const rivalry = rivalries[key];

    const { runs, totalBalls, wickets } = getScore({
      balls: [type],
      forBatsman: true,
    });

    const isValidBall = getIsvalidBall(type);

    if (isValidBall) rivalry.balls += totalBalls;
    if (wickets) {
      const typeId = Number(type.split("_")[1]);
      const wicketType = wicketTypes.find((item) => item.id === typeId);

      if (!wicketType?.isNotBowlersWicket) rivalry.wickets += wickets;
    }
    rivalry.runs += runs;
    rivalry.strikeRate = (rivalry.runs / rivalry.balls) * 100;
    if (type === "0") rivalry.dots++;
    if (!type.includes("-1") && (type.includes("4") || type.includes("6")))
      rivalry.boundaries++;

    rivalry.weight =
      rivalry.wickets * 15 +
      rivalry.runs +
      rivalry.boundaries * 2 +
      rivalry.dots / 2;

    rivalry.recentBalls.push(event.type);
  });

  return Object.values(rivalries).map((rivalry) => {
    let batsmanPoints = 0;
    let bowlerPoints = 0;

    batsmanPoints += rivalry.runs;

    batsmanPoints += rivalry.boundaries * 2;

    if (rivalry.balls > 12) {
      const sr = rivalry.strikeRate;

      let strikeRatePoints = 0;
      if (sr > 200) strikeRatePoints += 8;
      else if (sr >= 170 && sr <= 200) strikeRatePoints += 6;
      else if (sr >= 150 && sr <= 170) strikeRatePoints += 4;
      else if (sr >= 130 && sr <= 150) strikeRatePoints += 2;
      else if (sr >= 70 && sr <= 100) strikeRatePoints -= 4;
      else if (sr <= 70) strikeRatePoints -= 8;

      batsmanPoints += strikeRatePoints * (rivalry.balls / 3);
    }

    bowlerPoints += rivalry.wickets * 30;
    bowlerPoints += rivalry.dots;

    const batsmanDominance =
      (batsmanPoints / (batsmanPoints + bowlerPoints)) * 100;
    const bowlerDominance =
      (bowlerPoints / (batsmanPoints + bowlerPoints)) * 100;

    rivalry.dominance = [
      Math.round(Math.min(100, Math.max(0, batsmanDominance))) || 0,
      Math.round(Math.min(100, Math.max(0, bowlerDominance))) || 0,
    ];

    return rivalry;
  });
}

function PlayerRivalries({ ballEvents, players }: PlayerRivalriesProps) {
  const rivalries = getAllRivalries(ballEvents, players);

  const [showingRivalry, setShowingRivalry] = useState<RivalriesResult | null>(
    null,
  );

  return (
    <>
      <ul className="max-h-[calc(100dvh-160px)] min-h-96 overflow-y-auto p-2">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-6">
          {rivalries
            .sort((a, b) => b.weight - a.weight)
            .map((rivalry, i) => (
              <li
                key={i}
                className="flex cursor-pointer items-center justify-between rounded-md border p-2"
                onClick={() => setShowingRivalry(rivalry)}
              >
                <p>
                  <span className="font-semibold">{rivalry.batsman}</span> vs{" "}
                  {rivalry.bowler}
                </p>
                <p className="text-sm">
                  {rivalry.runs}
                  {rivalry.wickets === 0 && "*"} ({rivalry.balls})
                </p>
              </li>
            ))}
        </div>
      </ul>
      <Dialog
        open={!!showingRivalry}
        onOpenChange={() => setShowingRivalry(null)}
      >
        <DialogContent>
          {showingRivalry && (
            <RivalryCard rivalry={showingRivalry} inMatch player={null} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default PlayerRivalries;
