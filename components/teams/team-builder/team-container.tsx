import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PlayerSimplified } from "@/types";
import { Player } from "@prisma/client";
import { Trash } from "lucide-react";
import { memo, useState } from "react";

export interface TeamProps {
  handlePut: (item: any) => void;
  team: {
    name: string;
    players: PlayerSimplified[];
  };
  unselect: (playerId: Player["id"]) => void;
  handleNameChange: (name: string) => void;
  hasSelected: boolean;
}

export const TeamContainer = memo(function Team({
  handlePut,
  team,
  unselect,
  handleNameChange,
  hasSelected,
}: TeamProps) {
  const [updatingName, isUpdatingName] = useState(false);
  const [name, setName] = useState(team.name);

  return (
    <li className="w-full">
      <h3
        className="flex h-9 w-full items-center justify-center rounded-t-md bg-primary text-sm text-primary-foreground"
        onClick={() => isUpdatingName(true)}
      >
        {updatingName ? (
          <Input
            className="h-[unset] max-w-32 border-0 bg-background text-center text-foreground focus-visible:ring-0"
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
        onClick={() => handlePut(team)}
        className={cn(
          "h-48 space-y-2 overflow-y-auto rounded-md rounded-t-none border border-t-0 bg-card p-2",
          {
            "animate-pulse bg-muted": hasSelected,
          },
        )}
      >
        {team.players.map((player, i) => (
          <li key={player.id} className="flex items-center justify-between">
            <p className="max-w-32 truncate text-xs sm:text-sm">
              {player.name} {i === 0 && "(C)"}
            </p>
            <Button
              className="size-6 bg-destructive/5 p-0 text-destructive hover:bg-destructive/20"
              onClick={(e) => {
                e.stopPropagation();
                unselect(player.id);
              }}
              type="button"
            >
              <Trash className="size-3" />
            </Button>
          </li>
        ))}
      </ul>
    </li>
  );
});
