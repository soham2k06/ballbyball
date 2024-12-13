import { Metadata } from "next";

import { getAllMatches } from "@/lib/actions/match";
import prisma from "@/lib/db/prisma";
import { checkSession, getValidatedUser } from "@/lib/utils";
import { MatchExtended } from "@/types";

import MatchList from "@/features/matches/list";

export const metadata: Metadata = {
  title: "Matches - BallByBall",
  description: "List of matches",
};

interface Props {
  searchParams: {
    user: string;
    size: string;
  };
}

async function Matches({ searchParams }: Props) {
  const { user: userRef, size } = searchParams;
  const userId = userRef ?? (await getValidatedUser());
  if (!userRef) await checkSession();

  const matches = await getAllMatches(userRef, size);

  const matchesCount = await prisma.match.count({ where: { userId } });

  return (
    <div className="w-full">
      <h1 className="mb-4 text-3xl font-semibold tracking-tight max-sm:text-xl">
        Matches
      </h1>
      <MatchList
        matches={matches as MatchExtended[]}
        matchesCount={matchesCount}
      />
    </div>
  );
}

export default Matches;
