import Link from "next/link";
import { Edit, MoreHorizontal, Trash2 } from "lucide-react";

import { EventType, MatchExtended } from "@/types";
import { calculateWinner, getOverStr, getScore } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { TypographyP } from "../ui/typography";
import { UpdateMatchSchema } from "@/lib/validation/match";

type Team = { teams: { id: string }[] };

interface MatchProps {
  match: MatchExtended;
  setMatchToDelete: (matchId: string) => void;
  setMatchToUpdate: (match: (UpdateMatchSchema & Team) | undefined) => void;
}

function Match({ match, setMatchToDelete, setMatchToUpdate }: MatchProps) {
  const matchToUpdateVar = {
    ...match,
    teamIds: match.teams.map((team) => team.id),
  };

  const ballEventsbyTeam = (i: number) =>
    match.ballEvents
      .filter((event) => match.teams[i].playerIds.includes(event.batsmanId))
      .map((event) => event.type);

  const { runs: runs1 } = getScore(ballEventsbyTeam(0));
  const {
    runs: runs2,
    wickets: wickets2,
    totalBalls: totalBalls2,
  } = getScore(ballEventsbyTeam(1));
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
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle>{match.name}</CardTitle>
        <div className="flex items-center space-x-4">
          <Button asChild>
            <Link href={`/match/${match.id}`}>Play</Link>
          </Button>

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
        </div>
      </CardHeader>
      <CardContent>
        {match.teams.map(({ id, name, playerIds }) => {
          const ballEventsByTeam = match.ballEvents
            .filter((event) => playerIds.includes(event.batsmanId))
            .map((event) => event.type as EventType);

          const { runs, totalBalls, wickets } = getScore(ballEventsByTeam);

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
        <CardDescription className="absolute bottom-3 right-3 text-right">
          Started at <br />{" "}
          {Intl.DateTimeFormat("en-IN", {
            dateStyle: "short",
            timeStyle: "short",
          }).format(new Date(match.createdAt))}
        </CardDescription>
      </CardContent>
    </Card>
  );
}

export default Match;
