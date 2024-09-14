import { MouseEventHandler, useState } from "react";

import { wicketTypes } from "@/lib/constants";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
