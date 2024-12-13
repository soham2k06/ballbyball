import { memo } from "react";

import { cn } from "@/lib/utils";
import { PlayerSimplified } from "@/types";

export const PlayerSelect = memo(function Player({
  player,
  isLoading,
  setSelectedPlayer,
  isSelected,
}: {
  player: PlayerSimplified;
  isLoading?: boolean;
  // eslint-disable-next-line no-unused-vars
  setSelectedPlayer: (player: PlayerSimplified | null) => void;
  isSelected: boolean;
}) {
  return (
    <li
      onClick={() => setSelectedPlayer(isSelected ? null : player)}
      className={cn(
        "cursor-pointer select-none rounded-md border bg-card p-2 text-sm",
        {
          "cursor-not-allowed": isLoading,
          "border-emerald-500 bg-emerald-500 text-emerald-950": isSelected,
        },
      )}
    >
      {player.name}
    </li>
  );
});
