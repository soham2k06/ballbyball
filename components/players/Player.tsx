import { Player as PlayerSchemaType } from "@prisma/client";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";

import { truncStr } from "@/lib/utils";
import { UpdatePlayerSchema } from "@/lib/validation/player";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

interface PlayerProps {
  player: PlayerSchemaType;
  setPlayerToDelete: (playerId: string) => void;
  setPlayerToUpdate: (player: UpdatePlayerSchema) => void;
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
}: PlayerProps) {
  const handleDelete = (playerId: string) => setPlayerToDelete(playerId);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{truncStr(player.name as string, 10)}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <MoreHorizontal size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="gap-2 font-bold"
              onClick={() => setPlayerToUpdate(player)}
            >
              <Edit /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 font-bold"
              onClick={() => handleDelete(player.id)}
            >
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <Button
          variant="secondary"
          onClick={() =>
            setOpenedPlayer({
              id: player.id,
              name: player.name,
            })
          }
        >
          All time Stats
        </Button>
      </CardContent>
    </Card>
  );
}

export default Player;
