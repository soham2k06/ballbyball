import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PlayerSimplified } from "@/types";
import { Player } from "@prisma/client";
import { Trash } from "lucide-react";
import { memo, useState } from "react";
import { useDrop } from "react-dnd";

export interface TeamProps {
  onDrop: (item: any) => void;
  team: {
    name: string;
    players: PlayerSimplified[];
  };
  unselect: (playerId: Player["id"]) => void;
  handleNameChange: (name: string) => void;
}

export const TeamDrop = memo(function Team({
  onDrop,
  team,
  unselect,
  handleNameChange,
}: TeamProps) {
  const [updatingName, isUpdatingName] = useState(false);
  const [name, setName] = useState(team.name);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "player",
    drop: onDrop,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;

  return (
    <li ref={drop} className="w-full">
      <h3
        className="flex h-9 items-center justify-center rounded-t-md bg-primary text-sm text-primary-foreground"
        onClick={() => isUpdatingName(true)}
      >
        {updatingName ? (
          <Input
            className="h-[unset] w-fit border-0 bg-background text-center text-foreground focus-visible:ring-0"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => {
              isUpdatingName(false);
              handleNameChange(name);
            }}
          />
        ) : (
          team.name
        )}
      </h3>

      <ul
        className={cn(
          "max-h-80 min-h-48 space-y-2 overflow-y-auto rounded-md rounded-t-none border border-t-0 bg-card p-2",
          {
            "border-primary bg-muted": isActive,
          },
        )}
      >
        {team.players.map((player, i) => (
          <li key={player.id} className="flex items-center justify-between">
            <p className="max-w-32 truncate text-sm">
              {player.name} {i === 0 && "(C)"}
            </p>
            <Button
              className="size-6 bg-destructive/5 p-0 text-destructive hover:bg-destructive/20"
              onClick={() => unselect(player.id)}
            >
              <Trash className="size-3" />
            </Button>
          </li>
        ))}
      </ul>
    </li>
  );
});
