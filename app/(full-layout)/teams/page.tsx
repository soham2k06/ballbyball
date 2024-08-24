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

async function Teams() {
  await checkSession();

  const teams = await getAllTeams();
  const players = await getAllPlayers();
  return (
    <div className="w-full">
      <h1 className="mb-4 text-3xl font-semibold tracking-tight max-sm:text-xl">
        Teams
      </h1>
      <TeamList teams={teams ?? []} players={players as Player[]} />
    </div>
  );
}

export default Teams;
