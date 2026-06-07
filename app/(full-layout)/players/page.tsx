import { Metadata } from "next";

import { checkSession } from "@/lib/utils";

import PlayerList from "@/features/players/list";

export const metadata: Metadata = {
  title: "Players - BallByBall",
  description: "List of players",
};

interface Props {
  searchParams: Promise<{ user?: string }>;
}

async function page({ searchParams }: Props) {
  const { user: userRef } = await searchParams;
  if (!userRef) await checkSession();

  return (
    <div className="w-full">
      <h1 className="mb-1 text-3xl font-semibold tracking-tight max-sm:text-xl">
        Players
      </h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Click on a player to view their stats
      </p>
      <PlayerList userRef={userRef} />
    </div>
  );
}

export default page;
