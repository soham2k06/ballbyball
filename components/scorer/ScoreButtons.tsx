import { Button } from "../ui/button";
import { CardContent } from "../ui/card";
import { MouseEventHandler } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

function ScoreButtons({
  handleScore,
  ballEvents,
}: {
  handleScore: MouseEventHandler<HTMLButtonElement>;
  ballEvents: Record<string, string>;
}) {
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
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="secondary"
              className="w-full h-16 text-lg"
              value="-3"
            >
              NB
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            {Object.keys(ballEvents)
              .filter((ball) => ball !== "-1" && ball !== "-2")
              .map((event) => (
                <Button value={`-3${event}`} onClick={handleScore}>
                  {event}
                </Button>
              ))}
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
