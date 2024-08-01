import { Metadata } from "next";
import ScorerLayout from "@/components/scorer/ScorerLayout";
import { getMatchById } from "@/lib/actions/match";
import NoMatchFound from "@/components/scorer/NoMatchFound";
import { checkSession } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Match - BallByBall",
  description: "Match details. Start scoring here",
};

export default async function Match({
  params,
}: {
  params: { matchId: string };
}) {
  await checkSession();

  const match = await getMatchById(params.matchId);

  return (
    <div className="flex h-full flex-col items-center md:justify-center">
      {match ? (
        <ScorerLayout matchId={params.matchId} match={match} />
      ) : (
        <NoMatchFound />
      )}
    </div>
  );
}
