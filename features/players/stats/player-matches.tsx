import Link from "next/link";

import { usePlayerMatches } from "@/api-hooks/use-player-matches";
import { getOverStr, round } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface PlayerMatchesProps {
  playerId: string | undefined;
  // eslint-disable-next-line no-unused-vars
  setPlayerMatchesOpen: (playerId: string | undefined) => void;
}

function MatchSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-7 w-full" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </CardContent>
    </Card>
  );
}

function PlayerMatches({ playerId, setPlayerMatchesOpen }: PlayerMatchesProps) {
  const { data, isFetching } = usePlayerMatches(playerId);

  const matchesWon = data?.filter((match) => match.hasPlayerWon).length;
  const completedMatches = data?.filter(
    (match) => match.hasPlayerWon !== undefined,
  );
  const winRate = matchesWon
    ? round((matchesWon / (completedMatches?.length ?? 0)) * 100)
    : 0;

  return (
    <Dialog
      open={!!playerId}
      onOpenChange={() => setPlayerMatchesOpen(playerId ? undefined : playerId)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {data?.length} Matches - {matchesWon} ({winRate}%) Won
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-96">
          <ul className="space-y-3">
            {isFetching ? (
              <>
                <MatchSkeleton />
                <MatchSkeleton />
                <MatchSkeleton />
              </>
            ) : data?.length ? (
              data.map((match) => {
                const didBat = match.batScore.totalBalls > 0;
                const didBowl =
                  match.bowlScore.totalBalls > 0 || match.bowlScore.runs > 0;
                const isNotout = match.batScore.isNotout;

                return (
                  <Card key={match.id} className="rounded-md border shadow">
                    <Link
                      href={`/match/${match.id}`}
                      className="inline-block w-full p-2"
                    >
                      <CardHeader className="flex flex-row justify-between gap-2 space-y-0">
                        <CardTitle className="text-xl">
                          {match.name}{" "}
                          {match.hasPlayerWon !== undefined && (
                            <span className="font-sans text-xs">
                              {match.hasPlayerWon === true ? "(Won)" : "(Lost)"}
                            </span>
                          )}
                        </CardTitle>
                        <p className="text-right text-sm text-muted-foreground">
                          Created at{" "}
                          {new Date(match.createdAt).toLocaleDateString()}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between gap-2">
                          <p>
                            {didBat ? (
                              <>
                                {match.batScore.runs}
                                {isNotout && "*"} ({match.batScore.totalBalls})
                              </>
                            ) : (
                              "Did Not Bat"
                            )}{" "}
                            •{" "}
                            {didBowl ? (
                              <>
                                {match.bowlScore.wickets}/{match.bowlScore.runs}{" "}
                                ({getOverStr(match.bowlScore.totalBalls)})
                              </>
                            ) : (
                              "Did Not Bowl"
                            )}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {match.winInfo}
                        </p>
                      </CardContent>
                    </Link>
                  </Card>
                );
              })
            ) : (
              "No matches found"
            )}
          </ul>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

export default PlayerMatches;
