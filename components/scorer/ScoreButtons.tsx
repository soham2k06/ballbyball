import { Button } from "../ui/button";
import { CardContent } from "../ui/card";
import { MouseEventHandler } from "react";

import NoballPopver from "./NoballPopver";

function ScoreButtons({
  handleScore,
  ballEvents,
}: {
  handleScore: MouseEventHandler<HTMLButtonElement>;
  ballEvents: Record<string, string>;
}) {
  return (
    <CardContent className="space-y-4 max-sm:p-0">
      <div className="flex gap-2 justify-center w-full">
        {["0", "1", "2", "3"].map((event, i) => (
          <Button
            key={i}
            variant="secondary"
            className="w-full h-16 text-lg text-muted-foreground"
            value={event}
            onClick={handleScore}
          >
            {event}
          </Button>
        ))}
      </div>
      <div className="flex gap-2 justify-center w-full">
        <Button
          className="w-full h-16 text-lg font-bold bg-emerald-500 text-emerald-50 dark:bg-emerald-600 hover:bg-bg-emerald-500"
          value="4"
          onClick={handleScore}
        >
          4
        </Button>
        <Button
          className="w-full h-16 text-lg font-bold bg-amber-400 text-amber-950 dark:bg-amber-600 dark:text-amber-50 hover:bg-amber-400"
          value="6"
          onClick={handleScore}
        >
          6
        </Button>
      </div>
      <div className="flex gap-2 justify-center w-full">
        <Button
          variant="secondary"
          size="lg"
          className="w-full h-16 text-lg text-muted-foreground"
          value="-2"
          onClick={handleScore}
        >
          Wd
        </Button>
        <NoballPopver ballEvents={ballEvents} handleScore={handleScore} />

        <Button
          size="lg"
          className="w-full h-16 text-lg font-bold"
          variant="destructive"
          value="-1"
          onClick={handleScore}
        >
          OUT
        </Button>
      </div>
    </CardContent>
  );
}

export default ScoreButtons;
