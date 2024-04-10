import { BallEvent, Player } from "@prisma/client";

import { EventType } from "@/types";
import { usePlayerById } from "@/apiHooks/player";
import {
  abbreviateName,
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
import { wicketTypes } from "../score-buttons/WicketPopover";

function Score({
  players,
  ballEvents,
  isBowlingScore,
  fallOfWickets,
  hasYetToBatTeam,
  teamIndex,
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

  const {
    runs: teamRuns,
    wickets: teamWickets,
    totalBalls: teamBalls,
    extras: teamExtras,
  } = getScore(ballEvents.map((event) => event.type as EventType));

  return (
    <>
      <Table>
        {!isBowlingScore && (
          <TableCaption className="mt-8 border-t py-2 font-bold uppercase">
            Yet to bat
          </TableCaption>
        )}
        <TableHeader>
          <TableRow>
            <TableHead className="text-left">
              {isBowlingScore ? "Bowling" : "Batting"}
            </TableHead>
            {hasYetToBatTeam !== teamIndex && (
              <>
                <TableHead>{isBowlingScore ? "O" : "R"}</TableHead>
                <TableHead>{isBowlingScore ? "M" : "B"}</TableHead>
                <TableHead className="capitalize">
                  {isBowlingScore ? "W" : "4s"}
                </TableHead>
                <TableHead className="capitalize">
                  {isBowlingScore ? "R" : "6s"}
                </TableHead>
                <TableHead>{isBowlingScore ? "Econ" : "S/R"}</TableHead>
              </>
            )}
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

                return {
                  bowlerId,
                  fielderId: type.split("_")[2],
                  wicketType: wicketType?.shortName,
                  isNotBowlersWicket: wicketType?.isNotBowlersWicket,
                  typeStr:
                    !wicketType?.isNotBowlersWicket &&
                    `${[1, 2, 4].includes(Number(wicketType?.id)) ? "" : "b."} ${usePlayerById(bowlerId).player?.name}`,
                };
              })[0];

            const { player: fielder } = usePlayerById(outBy?.fielderId);

            const legalEvents = ballEvents.filter(
              (ball) =>
                ball.type !== "-2" &&
                player.id === ball[isBowlingScore ? "bowlerId" : "batsmanId"],
            );

            const { fours, sixes } = getBattingStats(legalEvents);

            const { runs, totalBalls, runRate, wickets } = getScore(
              legalEvents
                ?.filter(
                  (event) =>
                    event[isBowlingScore ? "bowlerId" : "batsmanId"] ===
                    player.id,
                )
                .map((event) => event.type as EventType),
            );

            if (!totalBalls) return null;

            if (!totalBalls && hasYetToBatTeam === teamIndex)
              return (
                <TableRow>
                  <TableCell colSpan={6} className="text-left font-semibold">
                    {player.name}
                  </TableCell>
                </TableRow>
              );

            function calculateMaidenOvers(ballsThrown: EventType[]) {
              let maidenOvers = 0;
              let ballsInCurrentOver = 0;

              let didRunCome = false;

              for (let i = 0; i < ballsThrown.length; i++) {
                const ball = ballsThrown[i];
                ballsInCurrentOver++;

                if (
                  !(
                    ball === "0" ||
                    (ball.includes("-1") && ball.split("_")[3] === "0")
                  )
                )
                  didRunCome = true;

                if (ballsInCurrentOver === 6) {
                  if (!didRunCome) maidenOvers++;

                  ballsInCurrentOver = 0;
                  didRunCome = false;
                }
              }

              return maidenOvers;
            }

            const maidenOverCount = calculateMaidenOvers(
              ballEvents
                .filter(
                  (ball) =>
                    ball.type !== "-2" &&
                    player.id ===
                      ball[isBowlingScore ? "bowlerId" : "batsmanId"],
                )
                .map((ball) => ball.type as EventType),
            );

            return (
              <>
                <TableRow>
                  <TableCell className="text-left font-semibold">
                    <p>
                      {player.name} {!outBy && !isBowlingScore && "**"}
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
                    {Math.round(
                      runRate * (!isBowlingScore ? 100 / 6 : 1) * 10,
                    ) / 10}
                  </TableCell>
                </TableRow>
              </>
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
      ) : (
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
      )}

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
