"use client";

import { useMatch } from "@/lib/hooks";

import { Skeleton } from "@/components/ui/skeleton";

import NoMatchFound from "./no-match-found";
import ScorerLayout from "./main-layout";

interface MatchLoaderProps {
  matchId: string;
  userRef: string | null;
}

function MatchLoader({ matchId, userRef }: MatchLoaderProps) {
  const { match, isLoading } = useMatch(matchId, userRef);

  if (isLoading) {
    return (
      <div className="flex w-full flex-col gap-4 sm:w-96">
        <Skeleton className="h-24 w-full rounded-md" />
        <Skeleton className="h-8 w-full rounded-md" />
        <Skeleton className="h-32 w-full rounded-md" />
        <Skeleton className="h-32 w-full rounded-md" />
        <Skeleton className="h-12 w-full rounded-md" />
      </div>
    );
  }

  return match ? (
    <ScorerLayout matchId={matchId} match={match} userRef={userRef} />
  ) : (
    <NoMatchFound />
  );
}

export default MatchLoader;
