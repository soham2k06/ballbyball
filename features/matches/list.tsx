"use client";

import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { useDeleteMatch, useMatches, useTeams } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { UpdateMatchSchema } from "@/lib/validation/match";

import AlertNote from "@/components/alert-note";
import EmptyState from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import Match from "./match-card";
import Start from "./start";
import StartUpdateMatchDialog from "./start-update-dialog";

function MatchList() {
  const searchParams = useSearchParams();
  const userRef = searchParams.get("user");
  const size = searchParams.get("size");

  const router = useRouter();

  const { teams, isLoading: isTeamsLoading, isFetching: isTeamsFetching } =
    useTeams();
  const { matches, matchesCount, isLoading } = useMatches(size, userRef);
  const { mutate: deleteMutate, isPending: isDeleting } = useDeleteMatch();

  const [matchToUpdate, setMatchToUpdate] = useState<
    (UpdateMatchSchema & { teams: { id: string }[] }) | undefined
  >(undefined);

  const [matchToDelete, setMatchToDelete] = useState<string | null>(null);

  function handleShowMore() {
    const curSize = parseInt(searchParams.get("size") ?? "5");
    const newRoute = `/matches?size=${curSize + 5}`;
    router.push(userRef ? `${newRoute}&user=${userRef}` : newRoute, {
      scroll: false,
    });
  }

  if (isLoading && !matches.length) {
    return (
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full rounded-md" />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn({
        "flex flex-col items-center": !matches?.length,
      })}
    >
      {!userRef && (
        <Start
          teams={teams}
          isLoading={isTeamsLoading}
          isFetching={isTeamsFetching}
        />
      )}
      {matches?.length ? (
        <>
          <ul className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matches?.map((match) => (
              <Match
                key={match.id}
                match={match}
                setMatchToDelete={setMatchToDelete}
                setMatchToUpdate={setMatchToUpdate}
              />
            ))}
          </ul>
          {matchesCount > matches.length && (
            <div className="mt-8 flex justify-center">
              <Button className="w-full max-w-md" onClick={handleShowMore}>
                Show more
              </Button>
            </div>
          )}
        </>
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
            isTeamsFetching={isTeamsFetching ?? false}
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
