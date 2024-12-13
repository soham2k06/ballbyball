import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Edit, Eye, MoreHorizontal, Play, Trash2 } from "lucide-react";

import { calculateWinner, getOverStr, getScore } from "@/lib/utils";
import { UpdateMatchSchema } from "@/lib/validation/match";
import { EventType, MatchExtended } from "@/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TypographyP } from "@/components/ui/typography";

type Team = { teams: { id: string }[] };

interface MatchProps {
  match: MatchExtended;
  // eslint-disable-next-line no-unused-vars
  setMatchToDelete: (matchId: string) => void;
  // eslint-disable-next-line no-unused-vars
  setMatchToUpdate: (match: (UpdateMatchSchema & Team) | undefined) => void;
}

function MatchCard({ match, setMatchToDelete, setMatchToUpdate }: MatchProps) {
  const searchParams = useSearchParams();
  const userRef = searchParams.get("user");

  const matchToUpdateVar = {
    ...match,
    teamIds: match.teams.map((team) => team.id),
  };

  const ballEventsbyTeam = (i: number) =>
    match.ballEvents
      .filter((event) => match.teams[i].playerIds.includes(event.batsmanId))
      .map((event) => event.type);

  const { runs: runs1 } = getScore({ balls: ballEventsbyTeam(0) });
  const {
    runs: runs2,
    wickets: wickets2,
    totalBalls: totalBalls2,
  } = getScore({ balls: ballEventsbyTeam(1) });
  const totalWickets = match.teams[1].playerIds.length;

  const { winInfo } = calculateWinner({
    allowSinglePlayer: match.allowSinglePlayer,
    matchBalls: match.overs * 6,
    runs1,
    runs2,
    teams: match.teams.map(({ name }) => name),
    totalBalls: totalBalls2,
    totalWickets,
    wickets2,
  });

  return (
    <Card className="relative flex flex-col justify-between">
      <CardHeader className="flex-row items-center justify-between gap-1 space-y-0">
        <CardTitle className="text-xl">{match.name}</CardTitle>
        <div className="flex items-center space-x-4">
          <Button asChild size="icon">
            <Link
              href={`/match/${match.id}${userRef ? `?user=${userRef}` : ""}`}
            >
              {!match.hasEnded && !userRef ? (
                <Play className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </Link>
          </Button>

          {!userRef && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <MoreHorizontal size={20} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="gap-2 font-bold"
                  onClick={() => setMatchToUpdate(matchToUpdateVar)}
                >
                  <Edit size={20} /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="gap-2 font-bold"
                  onClick={() => setMatchToDelete(match.id)}
                >
                  <Trash2 size={20} /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {match.teams.map(({ id, name, playerIds }) => {
          const ballEventsByTeam = match.ballEvents
            .filter((event) => playerIds.includes(event.batsmanId))
            .map((event) => event.type as EventType);

          const { runs, totalBalls, wickets } = getScore({
            balls: ballEventsByTeam,
          });

          return (
            <TypographyP
              key={id}
              className="leading-5 [&:not(:first-child)]:mt-2"
            >
              {name}:{" "}
              {ballEventsByTeam.length ? (
                <>
                  {runs}/{wickets} ({getOverStr(totalBalls)})
                </>
              ) : (
                "Yet to bat"
              )}
            </TypographyP>
          );
        })}
        {match.hasEnded && (
          <CardDescription className="mt-3">{winInfo}</CardDescription>
        )}
        <CardDescription className="absolute bottom-2 right-2 text-right sm:bottom-3 sm:right-3">
          Started at <br />{" "}
          {Intl.DateTimeFormat("en-IN", {
            dateStyle: "short",
          }).format(new Date(match.createdAt))}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

export default MatchCard;
