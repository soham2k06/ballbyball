import { Player } from "@prisma/client";
import { Edit, MoreHorizontal, Trash2, Users } from "lucide-react";

import { TeamWithPlayers } from "@/types";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeamProps {
  team: TeamWithPlayers;
  // eslint-disable-next-line no-unused-vars
  handleUpdateClick: (team: TeamWithPlayers) => void;
  // eslint-disable-next-line no-unused-vars
  setTeamToDelete: (id: string | undefined) => void;
  setShowingTeam: ({
    // eslint-disable-next-line no-unused-vars
    players,
    // eslint-disable-next-line no-unused-vars
    captainId,
    // eslint-disable-next-line no-unused-vars
    name,
  }: {
    players: Player[];
    captainId: string | null;
    name: string;
  }) => void;
  userRef: string | null;
}

function TeamCard({
  team,
  handleUpdateClick,
  setTeamToDelete,
  setShowingTeam,
  userRef,
}: TeamProps) {
  return (
    <>
      <Card className="flex items-center justify-between p-2 sm:p-4">
        <CardTitle className="truncate py-1 text-xl">{team.name}</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="shrink-0">
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
            {!userRef && (
              <>
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
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>
    </>
  );
}

export default TeamCard;
