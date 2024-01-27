import { Button } from "../ui/button";
import { CardContent } from "../ui/card";
import { MouseEventHandler, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

function ScoreButtons({
  handleScore,
  ballEvents,
}: {
  handleScore: MouseEventHandler<HTMLButtonElement>;
  ballEvents: Record<string, string>;
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  return (
    <CardContent className="space-y-2 p-0">
      <div className="flex gap-1 justify-center w-full">
        {["0", "1", "2", "3"].map((event, i) => (
          <Button
            key={i}
            variant="secondary"
            className="w-full h-16 text-lg"
            value={event}
            onClick={handleScore}
          >
            {event}
          </Button>
        ))}
      </div>
      <div className="flex gap-1 justify-center w-full">
        <Button
          className="w-full h-16 text-lg bg-emerald-500 text-emerald-50 dark:bg-emerald-600"
          value="4"
          onClick={handleScore}
        >
          4
        </Button>
        <Button
          className="w-full h-16 text-lg bg-amber-400 text-amber-950 dark:bg-amber-600 dark:text-amber-50"
          value="6"
          onClick={handleScore}
        >
          6
        </Button>
      </div>
      <div className="flex gap-1 justify-center w-full">
        {/* {["-2", "-3"].map((event, i) => (
        ))} */}
        <Button
          variant="secondary"
          className="w-full h-16 text-lg"
          value="-2"
          onClick={handleScore}
        >
          Wd
        </Button>
        <Popover
          open={isPopoverOpen}
          modal
          onOpenChange={() => setIsPopoverOpen((prev) => !prev)}
        >
          <PopoverTrigger asChild>
            <Button
              variant="secondary"
              className="w-full h-16 text-lg"
              value="-3"
            >
              NB
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60">
            <div className="w-full grid grid-cols-3 gap-2">
              {Object.keys(ballEvents)
                .filter(
                  (ball) => ball !== "-1" && ball !== "-2" && ball !== "-3"
                )
                .map((event) => (
                  <Button
                    className={
                      event === "6"
                        ? "bg-amber-400 font-semibold text-amber-950 dark:bg-amber-600 dark:text-amber-50"
                        : event === "4"
                        ? "bg-emerald-500 text-emerald-50 dark:bg-emerald-600"
                        : "bg-secondary text-secondary-foreground"
                    }
                    value={`-3${event}`}
                    onClick={(e) => {
                      handleScore(e);
                      setIsPopoverOpen(false);
                    }}
                  >
                    {event}
                  </Button>
                ))}
            </div>
          </PopoverContent>
        </Popover>

        <Button
          className="w-full h-16 text-lg"
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
