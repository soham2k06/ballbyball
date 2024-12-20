import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Player } from "@prisma/client";
import { Edit, LandPlot, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { UpdatePlayerSchema } from "@/lib/validation/player";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PlayerProps {
  player: Player;
  // eslint-disable-next-line no-unused-vars
  setPlayerToDelete: (playerId: string) => void;
  // eslint-disable-next-line no-unused-vars
  setPlayerToUpdate: (player: UpdatePlayerSchema) => void;
  // eslint-disable-next-line no-unused-vars
  setPlayerMatchesOpen: (playerId: string) => void;
  setOpenedPlayer: ({
    // eslint-disable-next-line no-unused-vars
    name,
    // eslint-disable-next-line no-unused-vars
    id,
  }: {
    id: string | undefined;
    name: string | undefined;
  }) => void;
  userRef?: string | null;
  isSorting: boolean;
}

function PlayerCard({
  player,
  userRef,
  isSorting,
  setPlayerToDelete,
  setPlayerToUpdate,
  setOpenedPlayer,
  setPlayerMatchesOpen,
}: PlayerProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: player.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = (playerId: string) => setPlayerToDelete(playerId);
  const handleShowMatches = (playerId: string) =>
    setPlayerMatchesOpen(playerId);

  return (
    <Card
      className="flex cursor-pointer items-center justify-between p-2 sm:p-4"
      {...(isSorting ? attributes : {})}
      {...(isSorting ? listeners : {})}
      style={isSorting ? style : undefined}
      ref={isSorting ? setNodeRef : undefined}
      onClick={() =>
        setOpenedPlayer({
          id: player.id,
          name: player.name,
        })
      }
    >
      <CardTitle className="w-full truncate py-1 text-xl">
        {player.name}
      </CardTitle>

      {!isSorting && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="shrink-0">
            <Button size="icon" variant="ghost">
              <MoreHorizontal size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="gap-2 font-medium"
              onClick={(e) => {
                e.stopPropagation();
                handleShowMatches(player.id);
              }}
            >
              <LandPlot size={20} /> Matches
            </DropdownMenuItem>
            {!userRef && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-2 font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (player.id.includes("optimistic"))
                      return toast.error(
                        "Error updating player, please reload and try again",
                      );
                    setPlayerToUpdate(player);
                  }}
                >
                  <Edit size={20} /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (player.id.includes("optimistic"))
                      return toast.error(
                        "Error deleting player, please reload and try again",
                      );
                    handleDelete(player.id);
                  }}
                >
                  <Trash2 size={20} /> Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </Card>
  );
}

export default PlayerCard;
