"use client";

import CreateTeam from "@/components/teams/CreateTeam";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TypographyH3, TypographyP } from "@/components/ui/typography";
import { useAllTeams } from "@/hooks/api/useAllTeams";
import { LoaderIcon } from "lucide-react";

function TeamList() {
  const { allTeams: teams, isFetching } = useAllTeams();

  if (isFetching || !teams)
    return (
      <div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
        <LoaderIcon className="animate-spin" />
      </div>
    );
  return (
    <>
      <Tabs defaultValue="account" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardContent>
                <TypographyH3>{teams[0].name}</TypographyH3>
                <TypographyP>
                  {/* {players[0].map((player) => player.name)} */}
                </TypographyP>
              </CardContent>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardContent>
                <TypographyH3>{teams[1].name}</TypographyH3>
                <TypographyP>
                  {/* {players[1].map((player) => player.name)} */}
                </TypographyP>
              </CardContent>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateTeam />
    </>
  );
}

export default TeamList;
