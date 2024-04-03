"use client";

import Link from "next/link";
import { LoaderIcon } from "lucide-react";

import { useAllMatches, useDeleteMatch } from "@/apiHooks/match";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { TypographyP } from "../ui/typography";

import StartMatchButton from "./StartMatch";
import { cn, getOverStr, getScore } from "@/lib/utils";
import { EventType } from "@/types";
import StartUpdateMatchDialog from "./StartUpdateMatchDialog";
import { useState } from "react";
import { UpdateMatchSchema } from "@/lib/validation/match";
import AlertNote from "../AlertNote";
import EmptyState from "../EmptyState";

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
      className={cn("md:p-8", {
        "flex flex-col items-center": !matches?.length,
      })}
    >
      {matches?.length ? (
        <ul>
          {matches?.map((match) => {
            const matchToUpdateVar = {
              ...match,
              teamIds: match.teams.map((team) => team.id),
            };

            const isThisDeleting = isDeleting && matchToDelete === match.id;
            return (
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>{match.name}</CardTitle>
                  <Button asChild>
                    <Link href={`/match/${match.id}`}>Play</Link>
                  </Button>
                  <Button onClick={() => setMatchToUpdate(matchToUpdateVar)}>
                    Edit
                  </Button>
                  <Button
                    disabled={isThisDeleting}
                    onClick={() => setMatchToDelete(match.id)}
                  >
                    Delete
                  </Button>
                </CardHeader>
                <CardContent>
                  {match.teams.map(({ name, teamPlayers }) => {
                    const ballEventsByTeam = match.ballEvents
                      .filter((event) =>
                        teamPlayers
                          .map(({ playerId }) => playerId)
                          .includes(event.batsmanId),
                      )
                      .map((event) => event.type as EventType);

                    const { runs, totalBalls, wickets } =
                      getScore(ballEventsByTeam);

                    return (
                      <TypographyP>
                        {name}:{" "}
                        {ballEventsByTeam.length ? (
                          <>
                            runs - {runs}/{wickets} ({getOverStr(totalBalls)})
                          </>
                        ) : (
                          "Yet to bat"
                        )}
                      </TypographyP>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
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
      />
    </div>
  );
}

export default MatchList;
