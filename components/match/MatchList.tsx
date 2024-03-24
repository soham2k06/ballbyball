"use client";

import Link from "next/link";
import { LoaderIcon } from "lucide-react";

import { useAllMatches } from "@/apiHooks/match";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { TypographyP } from "../ui/typography";

import StartMatchButton from "./StartMatch";

function MatchList() {
  const { matches, isFetching } = useAllMatches();

  const teams = matches?.map((match) => match.teams);

  if (isFetching)
    return (
      <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
        <LoaderIcon className="animate-spin" />
      </div>
    );

  if (!matches) throw new Error("Matches not found");

  return (
    <div>
      <StartMatchButton />
      <ul>
        {matches?.map((match, i) => {
          const players = teams?.[i].map((player) => player);

          return (
            <Card>
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>{match.name}</CardTitle>
                <Link href={`/match/${match.id}`}>
                  <Button>Play</Button>
                </Link>
              </CardHeader>
              <CardContent>
                {players?.map(({ name }) => <TypographyP>{name}</TypographyP>)}
              </CardContent>
            </Card>
          );
        })}
      </ul>
    </div>
  );
}

export default MatchList;
