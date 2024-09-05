import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { TeamContainer } from "./team-container";
import { PlayerSelect } from "./player-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createMultipleTeams } from "@/lib/actions/team";
import { useActionMutate } from "@/lib/hooks";
import LoadingButton from "@/components/ui/loading-button";
import { toastError, toPercentage } from "@/lib/utils";
import { toast } from "sonner";
import { PlayerSimplified } from "@/types";
import {
  usePlayers,
  useSortedPlayersByPerformance,
} from "@/apiHooks/player/usePlayers";
import { SortDesc } from "lucide-react";

export const ItemTypes = {
  FOOD: "food",
  GLASS: "glass",
  PAPER: "paper",
};

interface Player extends PlayerSimplified {
  totalPoints?: number;
}

interface TeamState {
  name: string;
  players: Player[];
}

export interface BoxSpec {
  name: string;
  type: string;
}
export interface ContainerState {
  droppedBoxNames: string[];
  boxes: BoxSpec[];
}

function TeamBuilder() {
  const { players: normalPlayers, isLoading, isFetched } = usePlayers();
  const [sortPlayers, setSortPlayers] = useState(false);

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const {
    sortedPlayers,
    isLoading: isSorting,
    isSorted,
    sort,
  } = useSortedPlayersByPerformance({ enabled: sortPlayers });

  const [players, setPlayers] = useState<Player[]>([]);
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

  const getTeamPoints = (index: 0 | 1) =>
    teams[index].players.reduce(
      (acc, player) => acc + (player.totalPoints ?? 0),
      0,
    );

  const team1Points = getTeamPoints(0);
  const team2Points = getTeamPoints(1);

  const winPercentages =
    isSorted && team1Points && team2Points
      ? toPercentage(team1Points, team2Points)
      : null;

  const { mutate, isPending } = useActionMutate(createMultipleTeams);

  const teamsPayload = teams.map((team) => ({
    name: team.name,
    playerIds: team.players.map((player) => player.id),
    captain: team.players[0]?.id,
  }));

  const unselectedPlayers = useMemo(() => {
    return isLoading
      ? Array.from({ length: 10 }).map((_, i) => ({
          id: i.toString(),
          name: "Loading...",
        }))
      : players.filter(
          (player) =>
            !teams.some((team) =>
              team.players.some((plr) => plr.id === player.id),
            ),
        );
  }, [players, teams, isLoading]);

  const handlePut = useCallback(
    (index: number) => {
      if (!selectedPlayer) return;
      const newPlayer = players.find(
        (players) => players.id === selectedPlayer.id,
      );
      if (!newPlayer) return;
      setTeams((prevTeams) => {
        const newTeams = [...prevTeams];

        newTeams[index] = {
          ...newTeams[index],
          players: [...newTeams[index].players, newPlayer],
        };
        setSelectedPlayer(null);
        return newTeams;
      });
    },
    [teams, selectedPlayer],
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

  useEffect(() => {
    if (sortedPlayers.length && isSorted) setPlayers(sortedPlayers);
    else if (isFetched) setPlayers(normalPlayers);
  }, [isFetched, isSorted]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mr-4">Build teams</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[95%] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Build teams</DialogTitle>
          <DialogDescription>
            Select and put players to build teams, double click on a team to
            rename
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <ul className="flex gap-2 sm:gap-4">
            {teams.map((team, index) => (
              <TeamContainer
                team={team}
                hasSelected={selectedPlayer !== null}
                handlePut={() => handlePut(index)}
                unselect={(playerId) => handleUnselect(playerId, index)}
                handleNameChange={(name) => handleNameChange(name, index)}
                key={index}
              />
            ))}
          </ul>
          {winPercentages && (
            <div className="mt-2 flex flex-col items-center justify-center gap-1 sm:gap-2">
              <h4 className="font-medium max-sm:text-sm sm:font-semibold">
                Winning chances
              </h4>
              <div className="flex w-full">
                <div
                  className="flex h-4 items-center justify-center rounded-l-md bg-emerald-500 text-xs font-semibold"
                  style={{ width: winPercentages[0] + "%" }}
                >
                  {winPercentages[0]}%
                </div>
                <div
                  className="flex h-4 items-center justify-center rounded-r-md bg-amber-500 text-xs font-semibold"
                  style={{ width: winPercentages[1] + "%" }}
                >
                  {winPercentages[1]}%
                </div>
              </div>
            </div>
          )}

          <div>
            <div className="mb-4 flex items-center justify-between gap-2 pt-2 sm:pt-4">
              <h3 className="font-semibold sm:text-lg">Players</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Sort by performance</span>
                <LoadingButton
                  size="icon"
                  variant="secondary"
                  type="button"
                  loading={isSorting}
                  onClick={() => {
                    setSortPlayers(true);
                    sort();
                  }}
                >
                  {!isSorting ? <SortDesc className="size-4" /> : null}
                </LoadingButton>
              </div>
            </div>
            <ul className="flex max-h-32 flex-wrap gap-3 overflow-y-auto">
              {unselectedPlayers.length ? (
                unselectedPlayers.map((player) => (
                  <PlayerSelect
                    isSelected={selectedPlayer?.id === player.id}
                    setSelectedPlayer={setSelectedPlayer}
                    player={player}
                    isLoading={isLoading}
                    key={player.id}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No players available
                </p>
              )}
            </ul>
          </div>

          <LoadingButton
            type="submit"
            className="mt-6 max-sm:w-full"
            loading={isPending}
          >
            Create teams
          </LoadingButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TeamBuilder;
