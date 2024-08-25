import { Player } from "@prisma/client";
import { memo } from "react";
import { useDrag } from "react-dnd";

type PlayerProps = Pick<Player, "name" | "id">;
export const PlayerDrag = memo(function Player({
  player,
}: {
  player: PlayerProps;
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
      className="select-none rounded-md border bg-card p-1 text-sm"
      style={{ opacity }}
    >
      {player.name}
    </li>
  );
});
