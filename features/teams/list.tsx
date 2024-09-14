"use client";

import { useState } from "react";

import { Player } from "@prisma/client";

import { deleteTeam } from "@/lib/actions/team";
import { useActionMutate } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { UpdateTeamSchema } from "@/lib/validation/team";
import { TeamWithPlayers } from "@/types";

import AddTeam from "@/features/teams/add-team";

import AlertNote from "@/components/alert-note";
import EmptyState from "@/components/empty-state";

import AddUpdateTeamDialog from "./add-update-team-dialog";
import TeamBuilder from "./team-builder";
import TeamCard from "./team-card";
import TeamPlayers from "./team-players";

function TeamList({
  teams,
  userRef,
}: {
  teams: TeamWithPlayers[];
  userRef: string | null;
}) {
  const { mutate: deleteMutate, isPending } = useActionMutate(deleteTeam);

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

  function handleDelete(id: string) {
    setTeamToDelete(id);
    deleteMutate(id, {
      onSettled() {
        setTeamToDelete(undefined);
      },
    });
  }

  function handleUpdateClick(_: unknown, team: TeamWithPlayers) {
    const teamToUpdateVar: UpdateTeamSchema & { matchId: string | null } = {
      playerIds: team.players?.map((player) => player.id) ?? [],
      ...team,
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
              <TeamCard
                key={team.id}
                team={team}
                setTeamToDelete={setTeamToDelete}
                setShowingTeam={setShowingTeam}
                userRef={userRef}
                handleUpdateClick={(team) => handleUpdateClick(i, team)}
              />
            );
          })}
        </ul>
      ) : (
        <EmptyState document="teams" />
      )}
      {!userRef && (
        <>
          <div>
            <TeamBuilder />
            <AddTeam />
          </div>
          <AddUpdateTeamDialog
            open={!!teamToUpdate}
            setOpen={() =>
              setTeamToUpdate(teamToUpdate ? undefined : teamToUpdate)
            }
            teamToUpdate={teamToUpdate}
          />

          <AlertNote
            open={!!teamToDelete}
            setOpen={() =>
              setTeamToDelete(teamToDelete ? undefined : teamToDelete)
            }
            content="Removing team may lead to bugs if the team is included in  matches. Do you still want to continue?"
            onConfirm={() => teamToDelete && handleDelete(teamToDelete)}
            isLoading={isPending}
          />
        </>
      )}

      <TeamPlayers
        showingTeam={showingTeam}
        onClose={() => setShowingTeam(undefined)}
      />
    </div>
  );
}

export default TeamList;
