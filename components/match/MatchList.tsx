"use client";

import { useState } from "react";
import { LoaderIcon } from "lucide-react";

import { useAllMatches, useDeleteMatch } from "@/apiHooks/match";
import { cn } from "@/lib/utils";
import { UpdateMatchSchema } from "@/lib/validation/match";

import AlertNote from "../AlertNote";
import EmptyState from "../EmptyState";
import StartUpdateMatchDialog from "./StartUpdateMatchDialog";
import StartMatchButton from "./StartMatch";
import Match from "./Match";

function MatchList() {
  const { matches, isLoading } = useAllMatches();

  const { deleteMatch, isPending: isDeleting } = useDeleteMatch();

  const [matchToUpdate, setMatchToUpdate] = useState<
    (UpdateMatchSchema & { teams: { id: string }[] }) | undefined
  >(undefined);

  const [matchToDelete, setMatchToDelete] = useState<string | null>(null);

  if (isLoading)
    return (
      <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
        <LoaderIcon className="animate-spin" />
      </div>
    );

  return (
    <div
      className={cn({
        "flex flex-col items-center md:p-8": !matches?.length,
        "py-8": matches?.length,
      })}
    >
      {matches?.length ? (
        <ul className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {matches?.map((match) => (
            <Match
              match={match}
              setMatchToDelete={setMatchToDelete}
              setMatchToUpdate={setMatchToUpdate}
            />
          ))}
        </ul>
      ) : (
        <EmptyState document="matches" />
      )}
      <StartMatchButton />

      <StartUpdateMatchDialog
        open={!!matchToUpdate}
        setOpen={() => setMatchToUpdate(undefined)}
        matchToUpdate={matchToUpdate}
      />
      <AlertNote
        open={!!matchToDelete}
        setOpen={() => setMatchToDelete(matchToDelete ? null : matchToDelete)}
        onConfirm={() => matchToDelete && deleteMatch(matchToDelete)}
        content="Removing matches will lead to removing all team and player stats connected with the match. Do you still want to continue?"
        isLoading={isDeleting}
      />
    </div>
  );
}

export default MatchList;
