import { Metadata } from "next";

import { checkSession } from "@/lib/utils";

import MatchList from "@/features/matches/list";

export const metadata: Metadata = {
  title: "Matches - BallByBall",
  description: "List of matches",
};

interface Props {
  searchParams: Promise<{ user?: string; size?: string }>;
}

async function Matches({ searchParams }: Props) {
  const { user: userRef } = await searchParams;
  if (!userRef) await checkSession();

  return (
    <div className="w-full">
      <h1 className="mb-4 text-3xl font-semibold tracking-tight max-sm:text-xl">
        Matches
      </h1>
      <MatchList />
    </div>
  );
}

export default Matches;
