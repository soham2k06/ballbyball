import { Player } from "@prisma/client";
import {
  AreaChart,
  Edit,
  LandPlot,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
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
}

function PlayerCard({
  player,
  userRef,
  setPlayerToDelete,
  setPlayerToUpdate,
  setOpenedPlayer,
  setPlayerMatchesOpen,
}: PlayerProps) {
  const handleDelete = (playerId: string) => setPlayerToDelete(playerId);
  const handleShowMatches = (playerId: string) =>
    setPlayerMatchesOpen(playerId);
  return (
    <Card className="flex items-center justify-between p-2 sm:p-4">
      <CardTitle className="truncate py-1 text-xl">{player.name}</CardTitle>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="shrink-0">
          <Button size="icon" variant="ghost">
            <MoreHorizontal size={20} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            className="gap-2 font-medium"
            onClick={() =>
              setOpenedPlayer({
                id: player.id,
                name: player.name,
              })
            }
          >
            <AreaChart size={20} /> Stats
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2 font-medium"
            onClick={() => handleShowMatches(player.id)}
          >
            <LandPlot size={20} /> Matches
          </DropdownMenuItem>
          {!userRef && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="gap-2 font-medium"
                onClick={() => {
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
                onClick={() => {
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
    </Card>
  );
}

export default PlayerCard;
