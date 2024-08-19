import { Player as PlayerSchemaType } from "@prisma/client";
import {
  AreaChart,
  Edit,
  LandPlot,
  MoreHorizontal,
  Trash2,
} from "lucide-react";

import { truncStr } from "@/lib/utils";
import { UpdatePlayerSchema } from "@/lib/validation/player";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Card, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

interface PlayerProps {
  player: PlayerSchemaType;
  setPlayerToDelete: (playerId: string) => void;
  setPlayerToUpdate: (player: UpdatePlayerSchema) => void;
  setPlayerMatchesOpen: (playerId: string) => void;
  setOpenedPlayer: ({
    name,
    id,
  }: {
    id: string | undefined;
    name: string | undefined;
  }) => void;
}

function Player({
  player,
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
      <CardTitle>{truncStr(player.name as string, 10)}</CardTitle>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
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
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="gap-2 font-medium"
            onClick={() => setPlayerToUpdate(player)}
          >
            <Edit size={20} /> Edit
          </DropdownMenuItem>
          <DropdownMenuItem
            className="gap-2 font-medium"
            onClick={() => handleDelete(player.id)}
          >
            <Trash2 size={20} /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  );
}

export default Player;
