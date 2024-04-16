import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Card, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Player as PlayerSchemaType } from "@prisma/client";
import { truncStr } from "@/lib/utils";
import { UpdatePlayerSchema } from "@/lib/validation/player";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";

interface PlayerProps {
  player: PlayerSchemaType;
  setPlayerToDelete: (playerId: string) => void;
  setPlayerToUpdate: (player: UpdatePlayerSchema) => void;
}

function Player({ player, setPlayerToDelete, setPlayerToUpdate }: PlayerProps) {
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
    </Card>
  );
}

export default Player;
