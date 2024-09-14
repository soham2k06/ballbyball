import { Metadata } from "next";

import { getMatchById } from "@/lib/actions/match";
import { checkSession } from "@/lib/utils";

import ScorerLayout from "@/features/match/scorer/main-layout";
import NoMatchFound from "@/features/match/scorer/no-match-found";

export const metadata: Metadata = {
  title: "Match - BallByBall",
  description: "Match details. Start scoring here",
};

export default async function Match({
  params,
  searchParams,
}: {
  params: { matchId: string };
  searchParams: { user: string };
}) {
  const userRef = searchParams.user;
  if (!userRef) await checkSession();

  const match = await getMatchById(params.matchId, userRef);

  return (
    <div className="flex h-full flex-col items-center md:justify-center">
      {match ? (
        <ScorerLayout
          matchId={params.matchId}
          match={match}
          userRef={userRef}
        />
      ) : (
        <NoMatchFound />
      )}
    </div>
  );
}
