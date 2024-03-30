"use client";

import Link from "next/link";
import { LoaderIcon } from "lucide-react";

import { useAllMatches } from "@/apiHooks/match";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { TypographyP } from "../ui/typography";

import StartMatchButton from "./StartMatch";
import { getOverStr, getScore } from "@/lib/utils";
import { EventType } from "@/types";

function MatchList() {
  const { matches, isFetching } = useAllMatches();

  if (isFetching)
    return (
      <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
        <LoaderIcon className="animate-spin" />
      </div>
    );

  // const runs = generateOverSummary({
  //   ballEvents: matches[0].ballEvents.map((event) => event.type as EventType),
  //   returnRunsOnly: true,
  // });

  return (
    <div>
      <StartMatchButton />
      <ul>
        {matches?.map((match) => {
          return (
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{match.name}</CardTitle>
                <Link href={`/match/${match.id}`}>
                  <Button>Play</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {match.teams.map(({ name, players }) => {
                  const ballEventsByTeam = match.ballEvents
                    .filter((event) =>
                      players.map(({ id }) => id).includes(event.batsmanId),
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
    </div>
  );
}

export default MatchList;
