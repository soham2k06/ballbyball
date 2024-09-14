import { MouseEventHandler, useState } from "react";

import { ballEvents } from "@/lib/constants";
import { cn, getIsvalidBall } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function NoballPopver({
  handleScore,
}: {
  handleScore: MouseEventHandler<HTMLButtonElement>;
}) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  return (
    <Popover
      open={isPopoverOpen}
      modal
      onOpenChange={() => setIsPopoverOpen((prev) => !prev)}
    >
      <PopoverTrigger asChild>
        <Button
          size="lg"
          variant="secondary"
          className="h-20 rounded-none text-lg text-muted-foreground"
        >
          NB
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60">
        <div className="grid w-full grid-cols-3 gap-2">
          {Object.keys(ballEvents)
            .filter(
              (event) =>
                !event.includes("-1") &&
                getIsvalidBall(event) &&
                event !== "-5",
            )
            .map((event, i) => (
              <Button
                key={i}
                variant="secondary"
                className={cn({
                  "bg-amber-400 font-semibold text-amber-950 hover:bg-amber-500 dark:bg-amber-600 dark:text-amber-50":
                    event === "6",
                  "bg-emerald-500 text-emerald-50 hover:bg-emerald-400 dark:bg-emerald-600":
                    event === "4",
                  "hover:brightness-95": event === "6" || event === "4",
                  "col-span-3": event === "-4",
                })}
                value={`-3${event}`}
                onClick={(e) => {
                  handleScore(e);
                  setIsPopoverOpen(false);
                }}
              >
                {event !== "-4" ? event : "Manual Strike"}
              </Button>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default NoballPopver;
