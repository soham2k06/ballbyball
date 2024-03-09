"use client";

import CreateTeam from "@/components/teams/CreateTeam";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TypographyP } from "@/components/ui/typography";
import { useAllTeams } from "@/hooks/api/team/useAllTeams";

import { LoaderIcon } from "lucide-react";
import { usePlayersByIds } from "@/hooks/api/player/usePlayersByIds";

function TeamList() {
  const { allTeams: teams, isFetching } = useAllTeams();

  const { players: playersArr, arePlayerFetching } = usePlayersByIds(
    teams?.map((team) => team.playerIds)!,
  );

  if (isFetching || arePlayerFetching)
    return (
      <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
        <LoaderIcon className="animate-spin" />
      </div>
    );

  if (!teams) {
    throw new Error("Team Not Found");
  }

  return (
    <div>
      <CreateTeam />
      <ul className="flex gap-4">
        {teams.map((team, i) => {
          const players = playersArr?.[i].map((player) => player);
          const captainIndex = players?.findIndex(
            (player, playerI) => player.id === team.captain,
          );

          console.log(
            players?.findIndex((player) => player.id === team.captain),
          );
          return (
            <Card>
              <CardHeader>
                <CardTitle>{team.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {players?.map(({ name }, playerIndex) => (
                  <TypographyP>
                    {name} {captainIndex === playerIndex && "(C)"}
                  </TypographyP>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </ul>
    </div>
  );
}

export default TeamList;
