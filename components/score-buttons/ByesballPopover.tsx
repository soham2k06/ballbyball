import { MouseEventHandler, useState } from "react";

import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn, getIsInvalidBall } from "@/lib/utils";

function BiceballPopver({
  handleScore,
  ballEvents,
}: {
  handleScore: MouseEventHandler<HTMLButtonElement>;
  ballEvents: Record<string, string>;
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
          className="h-20 w-full text-lg text-muted-foreground px-4"
          value="-3"
        >
          B
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60">
        <div className="grid w-full grid-cols-3 gap-2">
          {Object.keys(ballEvents)
            .filter((event) => !event.includes("-1") && getIsInvalidBall(event))
            .map((event, i) => (
              <Button
                key={i}
                variant="secondary"
                className={cn({
                  "bg-amber-400 font-semibold text-amber-950 dark:bg-amber-600 dark:text-amber-50":
                    event === "6",
                  "bg-emerald-500 text-emerald-50 dark:bg-emerald-600":
                    event === "4",
                  "hover:brightness-95": event === "6" || event === "4",
                  "col-span-3": event === "-4",
                })}
                value={`-5${event}`}
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

export default BiceballPopver;
