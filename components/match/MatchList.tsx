"use client";

import { useAllMatches } from "@/hooks/api/match/useAllMatches";
import StartMatchButton from "./StartMatch";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useTeamsByIds } from "@/hooks/api/team/useTeamsByIds";
import { LoaderIcon } from "lucide-react";
import { TypographyP } from "../ui/typography";

function MatchList() {
  const { matches, isFetching } = useAllMatches();

  const { teams, areTeamsFetching } = useTeamsByIds(
    matches?.map((match) => match.teamIds)!,
  );

  if (isFetching || areTeamsFetching)
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
              <CardHeader>
                <CardTitle>{match.name}</CardTitle>
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
