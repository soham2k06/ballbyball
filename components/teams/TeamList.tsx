"use client";

import { LoaderIcon } from "lucide-react";

import { useAllTeams } from "@/apiHooks/team";

import CreateTeam from "@/components/teams/AddTeam";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyP } from "@/components/ui/typography";
import { useDeleteTeam } from "@/apiHooks/team/useDeleteTeam";
import { useState } from "react";
import LoadingButton from "../ui/loading-button";
import { Button } from "../ui/button";
import AddUpdateTeamDialog from "./AddUpdateTeamDialog";
import { UpdateTeamSchema } from "@/lib/validation/team";
import { TeamWithPlayers } from "@/types";

function TeamList() {
  const { allTeams: teams, isFetching } = useAllTeams();

  const playersArr = teams?.map((team) => team.players);

  const { deleteTeam, isPending } = useDeleteTeam();

  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);

  const [teamToUpdate, setTeamToUpdate] = useState<
    (UpdateTeamSchema & { matchId: string | null }) | undefined
  >(undefined);

  if (isFetching)
    return (
      <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
        <LoaderIcon className="animate-spin" />
      </div>
    );

  if (!teams) throw new Error("Team Not Found");

  function handleDelete(id: string) {
    setTeamToDelete(id);
    deleteTeam(id, {
      onSettled() {
        setTeamToDelete(null);
      },
    });
  }

  function handleUpdateClick(_: unknown, team: TeamWithPlayers) {
    const teamToUpdateVar: UpdateTeamSchema & { matchId: string | null } = {
      id: team.id,
      name: team.name,
      playerIds: team.players?.map((player) => player.id) ?? [],
      captain: team.captain,
      matchId: team.matchId,
    };

    setTeamToUpdate(teamToUpdateVar);
  }

  return (
    <div>
      <CreateTeam />
      <ul className="flex gap-4">
        {teams.map((team, i) => {
          const players = playersArr?.[i];
          const captainIndex = players?.findIndex(
            (player) => player.id === team.captain,
          );

          const isLoading = isPending && teamToDelete === team.id;

          return (
            <Card>
              <CardHeader>
                <CardTitle>{team.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {players?.map(({ name }, playerIndex) => (
                  <TypographyP>
                    {name} {captainIndex === playerIndex && "(C)"}
                  </TypographyP>
                ))}
                <Button onClick={() => handleUpdateClick(0, team)}>Edit</Button>
                <LoadingButton
                  loading={isLoading}
                  disabled={isLoading}
                  onClick={() => handleDelete(team.id)}
                >
                  {isLoading ? "Deleting..." : "Delete"}
                </LoadingButton>
              </CardContent>
            </Card>
          );
        })}
      </ul>
      <AddUpdateTeamDialog
        open={!!teamToUpdate}
        setOpen={() => setTeamToUpdate(teamToUpdate ? undefined : teamToUpdate)}
        teamToUpdate={teamToUpdate}
      />
    </div>
  );
}

export default TeamList;
