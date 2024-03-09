"use client";

import CreateTeam from "@/components/teams/CreateTeam";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TypographyH3, TypographyP } from "@/components/ui/typography";
import { useAllTeams } from "@/hooks/api/team/useAllTeams";

import { LoaderIcon } from "lucide-react";
import { usePlayersByIds } from "@/hooks/api/player/usePlayersByIds";

function TeamList() {
  const { allTeams: teams, isFetching } = useAllTeams();

  const { players, arePlayerFetching } = usePlayersByIds(
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

  const team1Players = players?.[0].map((player) => player);
  const team2Players = players?.[1].map((player) => player);

  return (
    <>
      {teams.length ? (
        <Tabs defaultValue="team1" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="team1">{teams[0].name}</TabsTrigger>
            <TabsTrigger value="team2">{teams[1].name}</TabsTrigger>
          </TabsList>
          <TabsContent value="team1">
            <Card>
              <CardHeader>
                <CardContent>
                  <TypographyH3>{teams[0].name}</TypographyH3>
                  {team1Players?.map(({ id, name }) => (
                    <TypographyP key={id}>{name}</TypographyP>
                  ))}
                </CardContent>
              </CardHeader>
            </Card>
          </TabsContent>
          <TabsContent value="team2">
            <Card>
              <CardHeader>
                <CardContent>
                  <TypographyH3>{teams[1].name}</TypographyH3>
                  {team2Players?.map(({ id, name }) => (
                    <TypographyP key={id}>{name}</TypographyP>
                  ))}
                </CardContent>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <div>No teams to show</div>
      )}

      <CreateTeam />
    </>
  );
}

export default TeamList;
