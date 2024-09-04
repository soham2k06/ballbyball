import { BallEvent, Player, Team } from "@prisma/client";

import { EventType } from "@/types";
import {
  abbreviateName,
  calculateMaidenOvers,
  getBattingStats,
  getOverStr,
  getScore,
} from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { wicketTypes } from "@/lib/constants";

function Score({
  players,
  ballEvents,
  isBowlingScore,
  fallOfWickets,
  hasYetToBatTeam,
  teamIndex,
  teams,
}: {
  players: Player[];
  ballEvents: BallEvent[];
  isBowlingScore?: boolean;
  hasYetToBatTeam: number | null;
  fallOfWickets: {
    score: number;
    ball: number;
    batsman: string | undefined;
  }[];
  teamIndex: number;
  teams: (Team & { players: Player[] })[];
}) {
  const hasYetToBat = players.filter((player) => {
    const isBatsman = ballEvents
      .map((event) => event.batsmanId)
      .includes(player.id);
    const isBowler = ballEvents
      .map((event) => event.bowlerId)
      .includes(player.id);
    return !(isBatsman || isBowler);
  });

  const teamEvents = ballEvents.map((event) => event.type as EventType);

  const {
    runs: teamRuns,
    wickets: teamWickets,
    totalBalls: teamBalls,
    extras: teamExtras,
  } = getScore({ balls: teamEvents });

  return (
    <>
      <Table>
        {!isBowlingScore && !!hasYetToBat.length && (
          <TableCaption className="mt-8 border-t py-2 font-bold uppercase">
            Yet to bat
          </TableCaption>
        )}
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">
              {isBowlingScore ? "Bowling" : "Batting"}
            </TableHead>
            <TableHead>{isBowlingScore ? "O" : "R"}</TableHead>
            <TableHead>{isBowlingScore ? "M" : "B"}</TableHead>
            <TableHead className="capitalize">
              {isBowlingScore ? "W" : "4s"}
            </TableHead>
            <TableHead className="capitalize">
              {isBowlingScore ? "R" : "6s"}
            </TableHead>
            <TableHead>{isBowlingScore ? "Econ" : "S/R"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {players.map((player) => {
            if (
              isBowlingScore &&
              !ballEvents.map((event) => event.bowlerId).includes(player.id)
            )
              return null;

            const outBy = ballEvents
              .filter(
                (event) =>
                  event.batsmanId === player.id && event.type.includes("-1"),
              )
              .map(({ bowlerId, type }) => {
                const typeId = Number(type.split("_")[1]);

                const wicketType = wicketTypes.find(
                  (item) => item.id === typeId,
                );

                const bowler = teams
                  .flatMap((team) => team.players)
                  .find((player) => player.id === bowlerId);

                return {
                  bowlerId,
                  fielderId: type.split("_")[2],
                  wicketType: wicketType?.shortName,
                  isNotBowlersWicket: wicketType?.isNotBowlersWicket,
                  typeStr:
                    !wicketType?.isNotBowlersWicket &&
                    `${[1, 2, 4].includes(Number(wicketType?.id)) ? "" : "b."} ${bowler?.name}`,
                };
              })[0];

            const fielder = teams
              .flatMap((team) => team.players)
              .find((player) => player.id === outBy?.fielderId);

            const legalEvents = ballEvents.filter(
              (ball) =>
                ball.type !== "-2" &&
                player.id === ball[isBowlingScore ? "bowlerId" : "batsmanId"],
            );

            const { fours, sixes } = getBattingStats(legalEvents);

            const playerEvents = ballEvents
              .filter(
                (ball) =>
                  player.id === ball[isBowlingScore ? "bowlerId" : "batsmanId"],
              )
              .map((ball) => ball.type as EventType);

            const { runs, totalBalls, runRate, wickets } = getScore({
              balls: playerEvents,
              forBatsman: !isBowlingScore,
              forBowler: isBowlingScore,
            });

            if (!totalBalls) return null;

            if (!totalBalls && hasYetToBatTeam === teamIndex)
              return (
                <TableRow key={player.id}>
                  <TableCell colSpan={6} className="text-left font-semibold">
                    {player.name}
                  </TableCell>
                </TableRow>
              );

            const maidenOverCount = isBowlingScore
              ? calculateMaidenOvers(
                  ballEvents
                    .filter((ball) => player.id === ball.bowlerId)
                    .map((ball) => ball.type as EventType),
                )
              : 0;

            return (
              <TableRow key={player.id}>
                <TableCell className="text-left font-semibold">
                  <p>
                    {player.name} {!outBy && !isBowlingScore && "*"}
                  </p>
                  {outBy && (
                    <span className="mt-0.5 text-[13px] text-muted-foreground">
                      {outBy.wicketType} {fielder?.name} {outBy.typeStr}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {isBowlingScore ? getOverStr(totalBalls) : runs}
                </TableCell>
                <TableCell>
                  {isBowlingScore ? maidenOverCount : totalBalls}
                </TableCell>
                <TableCell>{isBowlingScore ? wickets : fours}</TableCell>
                <TableCell>{isBowlingScore ? runs : sixes}</TableCell>
                <TableCell>
                  {Math.round(runRate * (!isBowlingScore ? 100 / 6 : 1) * 10) /
                    10}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {!isBowlingScore ? (
        <ul className="flex flex-wrap divide-x-2">
          {hasYetToBat.map((player) => (
            <li key={player.id} className="my-0.5 px-2 text-sm">
              {player.name}
            </li>
          ))}
        </ul>
      ) : fallOfWickets.length ? (
        <div>
          <h6 className="mt-8 border-t px-2 py-2 text-center text-sm font-bold uppercase text-muted-foreground">
            Fall of wickets
          </h6>
          <ul className="flex flex-wrap divide-x-2">
            {fallOfWickets.map(({ score, ball, batsman }, index) => (
              <li key={index} className="my-1 px-2 text-sm">
                {score}/{index + 1}{" "}
                <span className="text-muted-foreground">
                  ({abbreviateName(batsman ?? "")}, {getOverStr(ball)} ov)
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="sticky bottom-0.5 m-2 flex justify-between rounded-md bg-muted p-2">
        <span>
          {teamRuns}/{teamWickets} ({getOverStr(teamBalls)})
        </span>
        <span>Extras: {teamExtras}</span>
      </div>
    </>
  );
}

export default Score;
