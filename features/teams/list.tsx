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

  const [openTeam, setOpenTeam] = useState(false);

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
      {!userRef && (
        <div className="max-sm:grid max-sm:gap-2 sm:space-x-2">
          <TeamBuilder />
          <AddTeam />
        </div>
      )}
      {teams?.length ? (
        <ul className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
          {teams.map((team, i) => {
            return (
              <TeamCard
                key={team.id}
                team={team}
                setTeamToDelete={setTeamToDelete}
                setShowingTeam={setShowingTeam}
                userRef={userRef}
                handleUpdateClick={(team) => handleUpdateClick(i, team)}
                setOpen={setOpenTeam}
              />
            );
          })}
        </ul>
      ) : (
        <EmptyState document="teams" />
      )}
      {!userRef && (
        <>
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
        open={openTeam}
        onClose={() => {
          setOpenTeam(false);
          setTimeout(() => {
            setShowingTeam(undefined);
          }, 200);
        }}
      />
    </div>
  );
}

export default TeamList;
