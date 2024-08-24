import { Metadata } from "next";

import PlayerList from "@/components/players/PlayerList";
import { getAllPlayers } from "@/lib/actions/player";
import { Player } from "@prisma/client";
import { checkSession } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Players - BallByBall",
  description: "List of players",
};

async function page() {
  await checkSession();
  const players = await getAllPlayers();
  return (
    <div className="w-full">
      <h1 className="mb-4 text-3xl font-semibold tracking-tight max-sm:text-xl">
        Players
      </h1>
      <PlayerList players={players as Player[]} />
    </div>
  );
}

export default page;
