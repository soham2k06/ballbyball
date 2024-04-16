"use client";

import { useState } from "react";
import { LoaderIcon } from "lucide-react";

import { useAllTeams } from "@/apiHooks/team";

import { useDeleteTeam } from "@/apiHooks/team/useDeleteTeam";
import CreateTeam from "@/components/teams/AddTeam";
import AddUpdateTeamDialog from "./AddUpdateTeamDialog";
import { UpdateTeamSchema } from "@/lib/validation/team";
import { TeamWithPlayers } from "@/types";
import EmptyState from "../EmptyState";
import { cn } from "@/lib/utils";
import Team from "./Team";
import AlertNote from "../AlertNote";
import { Player } from "@prisma/client";
import TeamPlayers from "./TeamPlayers";

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

  console.log(showingTeam);

  if (isFetching)
    return (
      <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
        <LoaderIcon className="animate-spin" />
      </div>
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

  console.log(showingTeam);

  return (
    <div
      className={cn("md:p-8", {
        "flex flex-col items-center": !teams?.length,
      })}
    >
      {teams?.length ? (
        <ul className="grid grid-cols-4 gap-4 pb-4">
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
