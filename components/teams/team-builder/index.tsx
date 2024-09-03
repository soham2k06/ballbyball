import { FormEvent, useCallback, useState } from "react";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TeamDrop } from "./team-drop";
import { PlayerDrag } from "./player-drag";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Player } from "@prisma/client";
import { createMultipleTeams } from "@/lib/actions/team";
import { useActionMutate } from "@/lib/hooks";
import LoadingButton from "@/components/ui/loading-button";
import { toastError } from "@/lib/utils";
import { toast } from "sonner";
import { PlayerSimplified } from "@/types";

export const ItemTypes = {
  FOOD: "food",
  GLASS: "glass",
  PAPER: "paper",
};

interface TeamState {
  name: string;
  players: PlayerSimplified[];
}

export interface BoxSpec {
  name: string;
  type: string;
}
export interface ContainerState {
  droppedBoxNames: string[];
  boxes: BoxSpec[];
}

function TeamBuilder({ players }: { players: PlayerSimplified[] }) {
  const [open, setOpen] = useState(false);

  const [teams, setTeams] = useState<TeamState[]>([
    {
      name: "Team 1",
      players: [],
    },
    {
      name: "Team 2",
      players: [],
    },
  ]);

  const { mutate, isPending } = useActionMutate(createMultipleTeams);

  const teamsPayload = teams.map((team) => ({
    name: team.name,
    playerIds: team.players.map((player) => player.id),
    captain: team.players[0]?.id,
  }));

  const unselectedPlayers = players.filter(
    (player) => !teams.some((team) => team.players.includes(player)),
  );

  const handleDrop = useCallback(
    (index: number, player: Player) => {
      setTeams((prevTeams) => {
        const newTeams = [...prevTeams];
        newTeams[index] = {
          ...newTeams[index],
          players: [...newTeams[index].players, player],
        };
        return newTeams;
      });
    },
    [teams],
  );

  const handleUnselect = useCallback((playerId: string, index: number) => {
    setTeams((prevTeams) => {
      const newTeams = [...prevTeams];
      newTeams[index] = {
        ...newTeams[index],
        players: newTeams[index].players.filter(
          (player) => player.id !== playerId,
        ),
      };
      return newTeams;
    });
  }, []);

  const handleNameChange = useCallback(
    (name: string, index: number) => {
      setTeams((prevTeams) => {
        const newTeams = [...prevTeams];
        newTeams[index] = {
          ...newTeams[index],
          name,
        };
        return newTeams;
      });
    },
    [teams],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (teamsPayload.some((team) => team.playerIds.length === 0))
        return toastError(new Error("Each team must have at least one player"));

      if (teamsPayload.some((team) => team.name.length === 0))
        return toastError(new Error("Each team must have a name"));

      await mutate(teamsPayload, {
        onError: (error) => toastError(error),
        onSuccess: () => {
          toast.success("Teams created successfully");
          setOpen(false);
        },
      });
    },
    [mutate, teamsPayload],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mr-4">Build teams</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Build teams</DialogTitle>
          <DialogDescription>
            Drag and drop players to build teams, double click to rename a team
          </DialogDescription>
        </DialogHeader>
        <DndProvider backend={HTML5Backend}>
          <form onSubmit={handleSubmit}>
            <ul className="flex gap-4 pb-6">
              {teams.map((team, index) => (
                <TeamDrop
                  team={team}
                  onDrop={(item) => handleDrop(index, item)}
                  unselect={(playerId) => handleUnselect(playerId, index)}
                  handleNameChange={(name) => handleNameChange(name, index)}
                  key={index}
                />
              ))}
            </ul>

            <ul className="flex max-h-32 flex-wrap gap-3 overflow-y-auto">
              {unselectedPlayers.map((player, i) => (
                <PlayerDrag player={player} key={player.id} />
              ))}
            </ul>

            <LoadingButton type="submit" className="mt-6" loading={isPending}>
              Create teams
            </LoadingButton>
          </form>
        </DndProvider>
      </DialogContent>
    </Dialog>
  );
}

export default TeamBuilder;
