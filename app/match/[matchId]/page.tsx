import { Metadata } from "next";

import { checkSession } from "@/lib/utils";

import MatchLoader from "@/features/match/scorer/match-loader";

export const metadata: Metadata = {
  title: "Match - BallByBall",
  description: "Match details. Start scoring here",
};

interface Props {
  params: Promise<{ matchId: string }>;
  searchParams: Promise<{ user?: string }>;
}

export default async function Match({ params, searchParams }: Props) {
  const [{ matchId }, { user: userRef }] = await Promise.all([
    params,
    searchParams,
  ]);

  if (!userRef) await checkSession();

  return (
    <div className="flex h-full flex-col items-center md:justify-center">
      <MatchLoader matchId={matchId} userRef={userRef ?? null} />
    </div>
  );
}
