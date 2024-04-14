"use client";

import { useState } from "react";
import Link from "next/link";
import { LoaderIcon } from "lucide-react";

import { EventType } from "@/types";
import { useAllMatches, useDeleteMatch } from "@/apiHooks/match";
import { calculateWinner, cn, getOverStr, getScore } from "@/lib/utils";
import { UpdateMatchSchema } from "@/lib/validation/match";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { TypographyP } from "../ui/typography";

import AlertNote from "../AlertNote";
import EmptyState from "../EmptyState";
import StartUpdateMatchDialog from "./StartUpdateMatchDialog";
import StartMatchButton from "./StartMatch";

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

            const ballEventsbyTeam = (i: number) =>
              match.ballEvents
                .filter((event) =>
                  match.teams[i].teamPlayers
                    .map(({ playerId }) => playerId)
                    .includes(event.batsmanId),
                )
                .map((event) => event.type);

            const { runs: runs1 } = getScore(ballEventsbyTeam(0));
            const {
              runs: runs2,
              wickets: wickets2,
              totalBalls: totalBalls2,
            } = getScore(ballEventsbyTeam(1));
            const totalWickets = match.teams[1].teamPlayers.length;

            const { winInfo } = calculateWinner({
              allowSinglePlayer: match.allowSinglePlayer,
              matchBalls: match.overs * 6,
              runs1,
              runs2,
              teams: match.teams.map(({ name }) => name),
              totalBalls: totalBalls2,
              totalWickets,
              wickets2,
            });

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
                  <Button onClick={() => setMatchToDelete(match.id)}>
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
                  {match.hasEnded && winInfo}
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
        isLoading={isDeleting}
      />
    </div>
  );
}

export default MatchList;
