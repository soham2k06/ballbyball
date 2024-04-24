"use client";

import { useState } from "react";
import { Player } from "@prisma/client";

import { TeamWithPlayers } from "@/types";

import { cn } from "@/lib/utils";
import { UpdateTeamSchema } from "@/lib/validation/team";

import { useAllTeams } from "@/apiHooks/team";
import { useDeleteTeam } from "@/apiHooks/team/useDeleteTeam";

import CreateTeam from "@/components/teams/AddTeam";
import { Skeleton } from "@/components/ui/skeleton";

import EmptyState from "@/components/EmptyState";
import AlertNote from "@/components/AlertNote";

import TeamPlayers from "./TeamPlayers";
import AddUpdateTeamDialog from "./AddUpdateTeamDialog";
import Team from "./Team";

function TeamList() {
  const { allTeams: teams, isFetching } = useAllTeams();

  const { deleteTeam, isPending } = useDeleteTeam();

  const [teamToDelete, setTeamToDelete] = useState<string | undefined>();

  const [teamToUpdate, setTeamToUpdate] = useState<
    (UpdateTeamSchema & { matchId: string | null }) | undefined
  >();

  const [showingTeam, setShowingTeam] = useState<
    | {
        name: string;
        players: Player[];
        captainId: string | null;
      }
    | undefined
  >(undefined);

  if (isFetching)
    return (
      <ul className="grid grid-cols-2 gap-2 pb-4 md:grid-cols-4 lg:grid-cols-6">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-14 sm:h-[72px]"></Skeleton>
          ))}
      </ul>
    );

  function handleDelete(id: string) {
    setTeamToDelete(id);
    deleteTeam(id, {
      onSettled() {
        setTeamToDelete(undefined);
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
    <div
      className={cn({
        "flex flex-col items-center": !teams?.length,
      })}
    >
      {teams?.length ? (
        <ul className="grid grid-cols-2 gap-2 pb-4 md:grid-cols-4 lg:grid-cols-6">
          {teams.map((team, i) => {
            return (
              <Team
                team={team}
                setTeamToDelete={setTeamToDelete}
                setShowingTeam={setShowingTeam}
                handleUpdateClick={(team) => handleUpdateClick(i, team)}
              />
            );
          })}
        </ul>
      ) : (
        <EmptyState document="teams" />
      )}
      <CreateTeam />

      <AddUpdateTeamDialog
        open={!!teamToUpdate}
        setOpen={() => setTeamToUpdate(teamToUpdate ? undefined : teamToUpdate)}
        teamToUpdate={teamToUpdate}
      />

      <AlertNote
        open={!!teamToDelete}
        setOpen={() => setTeamToDelete(teamToDelete ? undefined : teamToDelete)}
        content="Removing team may lead to bugs if the team is included in  matches. Do you still want to continue?"
        onConfirm={() => teamToDelete && handleDelete(teamToDelete)}
        isLoading={isPending}
      />

      <TeamPlayers
        showingTeam={showingTeam}
        onClose={() => setShowingTeam(undefined)}
      />
    </div>
  );
}

export default TeamList;
