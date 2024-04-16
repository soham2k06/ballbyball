import { Player } from "@prisma/client";
import { Edit, MoreHorizontal, Trash2, Users } from "lucide-react";

import { TeamWithPlayers } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card>
        <CardHeader className="flex-row items-center justify-between">
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
                <Users /> Players
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 font-bold"
                onClick={() => handleUpdateClick(team)}
              >
                <Edit /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2 font-bold"
                onClick={() => setTeamToDelete(team.id)}
              >
                <Trash2 /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
      </Card>
    </>
  );
}

export default Team;
