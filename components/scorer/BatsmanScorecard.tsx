import { BallEvent } from "@prisma/client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getScore } from "@/lib/utils";
import { EventType, MatchWithTeams, TeamWithPlayers } from "@/types";
import { usePlayerById } from "@/apiHooks/player";

interface BatsmanScorecardProps {
  match: MatchWithTeams;
  ballEvents: BallEvent[];
}

function BatsmanScorecard({ match, ballEvents }: BatsmanScorecardProps) {
  const teams = match.teams;

  const curTeam = match.curTeam;
  const notCurTeam = match.curTeam === 0 ? 1 : 0;

  const isInSecondInning = !new Set(
    match.teams[curTeam].players.map((player) => player.id),
  ).has(ballEvents[0]?.batsmanId);

  const firstBattingTeamIndex = isInSecondInning ? notCurTeam : curTeam;
  const secondBattingTeamIndex = isInSecondInning ? curTeam : notCurTeam;

  const firstBattingTeam = teams[firstBattingTeamIndex];
  const secondBattingTeam = teams[secondBattingTeamIndex];

  function getScoreProps(team: TeamWithPlayers, isBowlingScore?: boolean) {
    return {
      ballEvents: ballEvents.filter((event) =>
        team.players
          .map(({ id }) => id)
          .includes(event[isBowlingScore ? "bowlerId" : "batsmanId"]),
      ),
      isBowlingScore,
      team,
    };
  }

  const tabs = [
    {
      id: "1-bat",
      name: `${firstBattingTeam.name} - Batting`,
      content: <BattingScore {...getScoreProps(firstBattingTeam)} />,
    },
    {
      id: "2-bowl",
      name: `${secondBattingTeam.name} - Bowling`,
      content: <BattingScore {...getScoreProps(secondBattingTeam, true)} />,
    },
    {
      id: "2-bat",
      name: `${secondBattingTeam.name} - Batting`,
      content: <BattingScore {...getScoreProps(secondBattingTeam)} />,
    },
    {
      id: "1-bowl",
      name: `${firstBattingTeam.name} - Bowling`,
      content: <BattingScore {...getScoreProps(firstBattingTeam, true)} />,
    },
  ];

  if (!teams) return <p>loading...</p>;

  return (
    <div>
      <Tabs defaultValue="1-bat">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function BattingScore({
  team,
  ballEvents,
  isBowlingScore,
}: {
  team: TeamWithPlayers;
  ballEvents: BallEvent[];
  isBowlingScore?: boolean;
}) {
  return (
    <>
      {/* {!isCurrentBatting && <p>Yet to bat</p>} */}

      {team.players.map((player) => {
        if (
          isBowlingScore &&
          !ballEvents.map((event) => event.bowlerId).includes(player.id)
        )
          return null;
        const outBy = ballEvents
          .filter(
            (event) => event.batsmanId === player.id && event.type === "-1",
          )
          .map(({ bowlerId }) => bowlerId);

        const { player: playerOutBy } = usePlayerById(outBy[0]);

        const legalEvents = ballEvents.filter(
          (ball) =>
            ball.type !== "-2" &&
            player.id === ball[isBowlingScore ? "bowlerId" : "batsmanId"],
        );

        const scoreByState = legalEvents?.reduce(
          (acc: { fours: number; sixes: number }, ballEvent: BallEvent) => {
            if (ballEvent.type === "4") acc.fours++;
            else if (ballEvent.type === "6") acc.sixes++;

            return acc;
          },
          { fours: 0, sixes: 0 },
        );

        const { runs, totalBalls } = getScore(
          legalEvents
            ?.filter(
              (event) =>
                event[isBowlingScore ? "bowlerId" : "batsmanId"] === player.id,
            )
            .map((event) => event.type as EventType),
        );

        return (
          <div key={player.id}>
            <p>
              {player.name} {playerOutBy?.name}
            </p>
            <div className="space-x-2">
              <span>{runs}</span>
              <span>
                {isBowlingScore ? (
                  <>
                    {Math.floor(totalBalls / 6)}
                    {totalBalls % 6 ? `.${totalBalls % 6}` : ""}
                  </>
                ) : (
                  totalBalls
                )}
              </span>
              <span>4s: {scoreByState?.fours}</span>
              <span>6s: {scoreByState?.sixes}</span>
            </div>
          </div>
        );
      })}
    </>
  );
}

export default BatsmanScorecard;
