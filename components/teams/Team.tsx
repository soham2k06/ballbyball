import { Player } from "@prisma/client";
import { Edit, MoreHorizontal, Trash2, Users } from "lucide-react";

import { TeamWithPlayers } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";

interface TeamProps {
  team: TeamWithPlayers;
  handleUpdateClick: (team: TeamWithPlayers) => void;
  setTeamToDelete: (id: string | undefined) => void;
  setShowingTeam: ({
    players,
    captainId,
    name,
  }: {
    players: Player[];
    captainId: string | null;
    name: string;
  }) => void;
}

function Team({
  team,
  handleUpdateClick,
  setTeamToDelete,
  setShowingTeam,
}: TeamProps) {
  return (
    <>
      <Card className="flex items-center justify-between p-2 sm:p-4">
        <CardTitle className="truncate">{team.name}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <MoreHorizontal size={20} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="gap-2 font-bold"
              onClick={() =>
                setShowingTeam({
                  players: team.players,
                  captainId: team.captain,
                  name: team.name,
                })
              }
            >
              <Users size={20} /> Players
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 font-bold"
              onClick={() => handleUpdateClick(team)}
            >
              <Edit size={20} /> Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-2 font-bold"
              onClick={() => setTeamToDelete(team.id)}
            >
              <Trash2 size={20} /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>
    </>
  );
}

export default Team;
