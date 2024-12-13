"use client";

import { useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { deleteMatch } from "@/lib/actions/match";
import { getAllTeams } from "@/lib/actions/team";
import { useActionMutate } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { UpdateMatchSchema } from "@/lib/validation/match";
import { MatchExtended } from "@/types";

import AlertNote from "@/components/alert-note";
import EmptyState from "@/components/empty-state";
import { Button } from "@/components/ui/button";

import Match from "./match-card";
import Start from "./start";
import StartUpdateMatchDialog from "./start-update-dialog";

function MatchList({
  matches,
  matchesCount,
}: {
  matches: MatchExtended[] | undefined;
  matchesCount: number;
}) {
  const searchParams = useSearchParams();
  const userRef = searchParams.get("user");

  const router = useRouter();

  const {
    data: teams = [],
    isLoading,
    isFetching,
  } = useQuery({
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
      className={cn({
        "flex flex-col items-center": !matches?.length,
      })}
    >
      {!userRef && (
        <Start teams={teams} isLoading={isLoading} isFetching={isFetching} />
      )}
      {matches?.length ? (
        <>
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
          {matchesCount > matches.length && (
            <div className="mt-8 flex justify-center">
              <Button
                className="w-full max-w-md"
                onClick={() => {
                  const curSize = parseInt(searchParams.get("size") ?? "5");
                  const newRoute = `/matches?size=${curSize + 5}`;
                  router.push(
                    userRef ? `${newRoute}&user=${userRef}` : newRoute,
                    {
                      scroll: false,
                    },
                  );
                }}
              >
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
            isTeamsFetching={isFetching}
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
