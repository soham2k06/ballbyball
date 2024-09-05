import { cn } from "@/lib/utils";
import { Player } from "@prisma/client";
import { memo } from "react";
import { useDrag } from "react-dnd";

type PlayerProps = Pick<Player, "name" | "id">;
export const PlayerDrag = memo(function Player({
  player,
  isLoading,
}: {
  player: PlayerProps;
  isLoading?: boolean;
}) {
  const [{ opacity }, drag] = useDrag(
    () => ({
      type: "player",
      item: player,
      collect: (monitor) => ({
        opacity: monitor.isDragging() ? 0.4 : 1,
      }),
    }),
    [player],
  );

  return (
    <li
      ref={drag}
      className={cn("rounded-md border bg-card px-2 py-3 text-sm", {
        "cursor-not-allowed": isLoading,
      })}
      style={{ opacity }}
    >
      {player.name}
    </li>
  );
});
