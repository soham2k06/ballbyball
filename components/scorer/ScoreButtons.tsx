import { MouseEventHandler } from "react";

import { Button } from "../ui/button";
import { CardContent } from "../ui/card";

import NoballPopver from "./NoballPopver";
import WicketPopover from "./WicketPopover";
import { ballEvents } from "@/lib/constants";

function ScoreButtons({
  handleScore,
  handleWicket,
}: {
  handleScore: MouseEventHandler<HTMLButtonElement>;
  handleWicket?: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <CardContent className="space-y-4 max-sm:p-0">
      <div className="flex w-full justify-center gap-2">
        <Button
          variant="secondary"
          size="lg"
          className="h-20 w-full text-lg text-muted-foreground"
          value="-2"
          onClick={handleScore}
        >
          Wd
        </Button>
        <NoballPopver ballEvents={ballEvents} handleScore={handleScore} />

        {handleWicket ? (
          <WicketPopover handleWicket={handleWicket} />
        ) : (
          <Button
            size="lg"
            variant="destructive"
            className="h-20 w-full text-lg font-bold"
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
        {["0", "1", "2", "3"].map((event, i) => (
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
      </div>
    </CardContent>
  );
}

export default ScoreButtons;
