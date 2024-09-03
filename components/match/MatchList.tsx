"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { UpdateMatchSchema } from "@/lib/validation/match";

import AlertNote from "../AlertNote";
import EmptyState from "../EmptyState";
import StartUpdateMatchDialog from "./StartUpdateMatchDialog";
import StartMatchButton from "./StartMatch";
import Match from "./Match";
import { MatchExtended } from "@/types";
import { useActionMutate } from "@/lib/hooks";
import { deleteMatch } from "@/lib/actions/match";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAllTeams } from "@/lib/actions/team";

function MatchList({ matches }: { matches: MatchExtended[] | undefined }) {
  const searchParams = useSearchParams();
  const userRef = searchParams.get("user");

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ["allTeams"],
    queryFn: () => getAllTeams(),
  });

  const { mutate: deleteMutate, isPending: isDeleting } =
    useActionMutate(deleteMatch);

  const [matchToUpdate, setMatchToUpdate] = useState<
    (UpdateMatchSchema & { teams: { id: string }[] }) | undefined
  >(undefined);

  const [matchToDelete, setMatchToDelete] = useState<string | null>(null);

  return (
    <div
      className={cn("py-4", {
        "flex flex-col items-center": !matches?.length,
      })}
    >
      {!userRef && <StartMatchButton teams={teams} isLoading={isLoading} />}
      {matches?.length ? (
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {matches?.map((match) => (
            <Match
              key={match.id}
              match={match}
              setMatchToDelete={setMatchToDelete}
              setMatchToUpdate={setMatchToUpdate}
            />
          ))}
        </ul>
      ) : (
        <EmptyState document="matches" />
      )}
      {!userRef && (
        <>
          <StartUpdateMatchDialog
            open={!!matchToUpdate}
            setOpen={() => setMatchToUpdate(undefined)}
            matchToUpdate={matchToUpdate}
            teams={teams}
          />
          <AlertNote
            open={!!matchToDelete}
            setOpen={() =>
              setMatchToDelete(matchToDelete ? null : matchToDelete)
            }
            onConfirm={() => matchToDelete && deleteMutate(matchToDelete)}
            content="Removing matches will lead to removing all team and player stats connected with the match. Do you still want to continue?"
            isLoading={isDeleting}
          />
        </>
      )}
    </div>
  );
}

export default MatchList;
