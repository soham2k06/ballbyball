import { cn, round } from "@/lib/utils";
import { EventType, RivalriesResult } from "@/types";

import ProgressSplit from "@/components/progress-split";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import BallSummary from "../match/scorer/ball-summary";

function RivalryCard({
  rivalry,
  player,
  inMatch,
}: {
  rivalry: RivalriesResult;
  player: string | null;
  inMatch?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="space-y-0 max-sm:pb-0">
        <CardTitle className="truncate max-sm:text-lg">
          <span
            className={cn({
              "font-normal": player && player !== rivalry.batsmanId,
            })}
          >
            {rivalry.batsman}
          </span>{" "}
          <span
            className={cn({
              "font-normal": player,
            })}
          >
            vs
          </span>{" "}
          <span
            className={cn({
              "font-normal": player && player !== rivalry.bowlerId,
            })}
          >
            {rivalry.bowler}
          </span>
        </CardTitle>
        {!!rivalry.matches && (
          <CardDescription>{rivalry.matches} matches</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <p className="mb-1 text-sm font-semibold">
          {rivalry.runs}
          {rivalry.wickets === 0 && "*"} ({rivalry.balls})
          {rivalry.wickets > 0 &&
            (inMatch ? " out" : <> - {rivalry.wickets} outs</>)}
        </p>
        <ul className="text-xs sm:text-sm">
          <li className="flex items-center justify-between">
            <h6 className="font-medium">Strike Rate</h6>
            <p>{round(rivalry.strikeRate, 1)}</p>
          </li>
          <li className="flex items-center justify-between">
            <h6 className="font-medium">Boundaries</h6>
            <p>{rivalry.boundaries}</p>
          </li>
          <li className="flex items-center justify-between">
            <h6 className="font-medium">Dots</h6>
            <p>{rivalry.dots}</p>
          </li>
        </ul>

        <ProgressSplit points={rivalry.dominance} title="Dominance" />
        {rivalry.recentBalls.length && (
          <ul className="mt-2 flex gap-2 overflow-auto py-2 sm:mt-4">
            {rivalry.recentBalls.map((event, i) => (
              <BallSummary key={i} event={event as EventType} size="xs" />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export default RivalryCard;
