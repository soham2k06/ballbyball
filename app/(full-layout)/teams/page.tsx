import TeamList from "@/components/teams/TeamList";
import { getAllPlayers } from "@/lib/actions/player";
import { getAllTeams } from "@/lib/actions/team";
import { checkSession } from "@/lib/utils";
import { Player } from "@prisma/client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teams | BallByBall",
  description: "Add, edit, and delete teams. List of all teams.",
};

interface Props {
  searchParams: {
    user: string;
  };
}

async function Teams({ searchParams }: Props) {
  const userRef = searchParams.user;
  if (!userRef) await checkSession();

  const teams = await getAllTeams(userRef);
  const players = await getAllPlayers(userRef);
  return (
    <div className="w-full">
      <h1 className="mb-4 text-3xl font-semibold tracking-tight max-sm:text-xl">
        Teams
      </h1>
      <TeamList
        teams={teams ?? []}
        players={players as Player[]}
        userRef={userRef}
      />
    </div>
  );
}

export default Teams;
