import { Metadata } from "next";
import MatchList from "@/components/match/MatchList";
import { getAllMatches } from "@/lib/actions/match";
import { checkSession } from "@/lib/utils";
import { MatchExtended } from "@/types";

export const metadata: Metadata = {
  title: "Matches - BallByBall",
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

  const matchesSimplified = await getAllMatches(userRef);

  return (
    <div className="w-full">
      <h1 className="mb-4 text-3xl font-semibold tracking-tight max-sm:text-xl">
        Matches
      </h1>
      <MatchList matches={matchesSimplified as MatchExtended[]} />
    </div>
  );
}

export default page;
