import TeamList from "@/components/teams/TeamList";
import { getAllPlayers } from "@/lib/actions/player";
import { getAllTeams } from "@/lib/actions/team";
import { Player } from "@prisma/client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teams | Ball by ball",
  description: "List of teams",
};

async function Teams() {
  const teams = await getAllTeams();
  const players = await getAllPlayers();
  return (
    <div>
      <h1 className="mb-4 text-3xl font-semibold tracking-tight max-sm:text-xl">
        Teams
      </h1>
      <TeamList teams={teams} players={players as Player[]} />
    </div>
  );
}

export default Teams;
