import { Metadata } from "next";

import { Player } from "@prisma/client";

import { getAllPlayers } from "@/lib/actions/player";
import { checkSession } from "@/lib/utils";

import PlayerList from "@/features/players/list";

export const metadata: Metadata = {
  title: "Players - BallByBall",
  description: "List of players",
};

interface Props {
  searchParams: {
    user: string;
  };
}

async function page({ searchParams }: Props) {
  const userRef = searchParams.user;
  if (!userRef) await checkSession();
  const players = await getAllPlayers(userRef);

  return (
    <div className="w-full">
      <h1 className="mb-4 text-3xl font-semibold tracking-tight max-sm:text-xl">
        Players
      </h1>
      <PlayerList players={players as Player[]} userRef={userRef} />
    </div>
  );
}

export default page;
