import { MouseEventHandler } from "react";

import { Button } from "@/components/ui/button";

import ByesballPopover from "./byes-popover";
import ManualScorePopover from "./manual-popover";
import NoballPopver from "./noball-popover";
import WicketPopover from "./wickets-popover";
import WideballPopver from "./wide-popover";

function ScoreButtons({
  handleScore,
  handleWicket,
  mode,
}: {
  handleScore: MouseEventHandler<HTMLButtonElement>;
  handleWicket?: MouseEventHandler<HTMLButtonElement>;
  mode: "instant" | "players";
}) {
  return (
    <div className="space-y-4">
      <div className="grid w-full grid-cols-4 justify-center gap-[2px] overflow-hidden rounded-md">
        <ByesballPopover handleScore={handleScore} />
        <WideballPopver handleScore={handleScore} />
        <NoballPopver handleScore={handleScore} />
        {handleWicket ? (
          <WicketPopover handleWicket={handleWicket} />
        ) : (
          <Button
            size="lg"
            variant="destructive"
            className="h-20 w-full rounded-none px-4 text-lg font-bold"
            value="-1"
            onClick={handleScore}
          >
            OUT
          </Button>
        )}
      </div>

      <div className="flex w-full justify-center gap-2">
        <Button
          className="hover:bg-bg-emerald-500 h-20 w-full bg-emerald-500 text-lg font-bold text-emerald-50 dark:bg-emerald-600"
          value="4"
          onClick={handleScore}
        >
          4
        </Button>
        <Button
          className="h-20 w-full bg-amber-400 text-lg font-bold text-amber-950 hover:bg-amber-400 dark:bg-amber-600 dark:text-amber-50"
          value="6"
          onClick={handleScore}
        >
          6
        </Button>
      </div>
      <div className="flex w-full justify-center gap-2">
        {["0", "1", "2"].map((event, i) => (
          <Button
            key={i}
            variant="secondary"
            className="h-20 w-full text-lg text-muted-foreground"
            value={event}
            onClick={handleScore}
          >
            {event}
          </Button>
        ))}
        <ManualScorePopover handleScore={handleScore} mode={mode} />
      </div>
    </div>
  );
}

export default ScoreButtons;
