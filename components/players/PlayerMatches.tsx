import { usePlayerMatches } from "@/apiHooks/player/usePlayerMatches";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { ScrollArea } from "../ui/scroll-area";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";
import { getOverStr, round } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface PlayerMatchesProps {
  playerId: string | undefined;
  setPlayerMatchesOpen: (playerId: string | undefined) => void;
}

function MatchSkeleton() {
  return (
    <li className="space-y-1 rounded-md border p-2 shadow">
      <Skeleton className="h-6 w-full" />
      <Skeleton className="h-4 w-1/3" />
    </li>
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
                  match.bowlScore.totalBalls > 0 && match.bowlScore.runs > 0;
                const isNotout = match.batScore.isNotout;

                return (
                  <Card key={match.id} className="rounded-md border shadow">
                    <Link
                      href={`/match/${match.id}`}
                      className="inline-block w-full p-2"
                    >
                      <CardHeader className="flex flex-row justify-between gap-2 space-y-0">
                        <CardTitle>
                          {match.name}{" "}
                          {match.hasPlayerWon !== undefined &&
                            (match.hasPlayerWon === true ? "(Won)" : "(Lost)")}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
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
                                {match.bowlScore.runs}/{match.bowlScore.wickets}{" "}
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
