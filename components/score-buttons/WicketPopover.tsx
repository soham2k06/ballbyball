import { MouseEventHandler, useState } from "react";

import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export const wicketTypes = [
  {
    id: 1,
    type: "Bowled",
    shortName: "b.",
  },
  {
    id: 2,
    type: "LBW",
    shortName: "lbw.",
  },
  {
    id: 3,
    type: "Caught",
    shortName: "c.",
    isOtherPlayerInvolved: true,
  },
  {
    id: 4,
    type: "Caught & Bowled",
    shortName: "c & b.",
  },
  {
    id: 5,
    type: "Run Out",
    shortName: "run out.",
    isOtherPlayerInvolved: true,
    isNotBowlersWicket: true,
  },
  {
    id: 6,
    type: "Stumped",
    shortName: "st.",
    isOtherPlayerInvolved: true,
  },
  {
    id: 7,
    type: "Hit Wicket",
    shortName: "hit wkt.",
    isNotBowlersWicket: true,
  },
  {
    id: 8,
    type: "Retired Hurt",
    shortName: "ret. hurt",
    isNotBowlersWicket: true,
  },
];

function WicketPopover({
  handleWicket,
}: {
  handleWicket: MouseEventHandler<HTMLButtonElement>;
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
          variant="destructive"
          className="h-20 rounded-none text-lg font-bold"
        >
          OUT
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="grid w-full grid-cols-2 gap-2">
        {wicketTypes.map((type, i) => (
          <Button
            key={i}
            size="sm"
            value={JSON.stringify(type)}
            onClick={(e) => {
              handleWicket(e);
              setIsPopoverOpen(false);
            }}
          >
            {type.type}
          </Button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

export default WicketPopover;
