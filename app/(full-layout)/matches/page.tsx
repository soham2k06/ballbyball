import { Metadata } from "next";
import MatchList from "@/components/match/MatchList";
import { getAllMatches } from "@/lib/actions/match";
import { getAllTeams } from "@/lib/actions/team";
import { checkSession } from "@/lib/utils";
import { MatchExtended } from "@/types";

export const metadata: Metadata = {
  title: "Matches - BallByBall",
  description: "List of players",
};

async function page() {
  await checkSession();

  const matchesSimplified = await getAllMatches();
  const teams = await getAllTeams();

  return (
    <div className="w-full">
      <h1 className="mb-4 text-3xl font-semibold tracking-tight max-sm:text-xl">
        Matches
      </h1>
      <MatchList
        matches={matchesSimplified as MatchExtended[]}
        teams={teams ?? []}
      />
    </div>
  );
}

export default page;
