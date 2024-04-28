import { AreaChart, Edit, MoreHorizontal, Trash2 } from "lucide-react";

import { processTeamName, truncStr } from "@/lib/utils";
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
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface PlayerProps {
  player: UpdatePlayerSchema;
  setPlayerToDelete: (playerId: string) => void;
  setPlayerToUpdate: (player: UpdatePlayerSchema) => void;
  setOpenedPlayer: (player: UpdatePlayerSchema) => void;
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
      <div className="flex items-center justify-between gap-2 p-2 sm:p-4">
        <div className="flex items-center gap-2">
          <Avatar className="size-8">
            <AvatarImage
              src={player.image}
              alt={player.name}
              width={32}
              height={32}
              className="size-8"
            />
            <AvatarFallback>{processTeamName(player.name)}</AvatarFallback>
          </Avatar>
          <CardTitle className="truncate max-md:text-sm">
            {truncStr(player.name, 10)}
          </CardTitle>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="flex-shrink-0">
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
              <AreaChart /> Stats
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem
              className="gap-2 font-medium"
              onClick={() => setPlayerToUpdate(player)}
            >
              <Edit /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 font-medium"
              onClick={() => handleDelete(player.id)}
            >
              <Trash2 /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}

export default Player;
