import { BallEvent } from "@prisma/client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getScore } from "@/lib/utils";
import { EventType, MatchWithTeams, TeamWithPlayers } from "@/types";

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

  const tabs = [
    {
      id: "1-bat",
      name: `${firstBattingTeam.name} - Batting`,
      content: (
        <BattingScore
          ballEvents={ballEvents.filter(
            (event) => event.batsmanId !== firstBattingTeam.id,
          )}
          isCurrentBatting={curTeam === firstBattingTeamIndex}
          team={firstBattingTeam}
        />
      ),
    },
    { id: "2-bowl", name: `${firstBattingTeam.name} - Bowling` },
    {
      id: "2-bat",
      name: `${secondBattingTeam.name} - Batting`,
      content: (
        <BattingScore
          ballEvents={ballEvents.filter(
            (event) => event.batsmanId !== secondBattingTeam.id,
          )}
          isCurrentBatting={curTeam === secondBattingTeamIndex}
          team={secondBattingTeam}
        />
      ),
    },
    { id: "1-bowl", name: `${secondBattingTeam.name} - Bowling` },
  ];

  if (!teams) return <p>loading...</p>;
  return (
    <div>
      <Tabs defaultValue="1-bat">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger value={tab.id}>{tab.name}</TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab, i) => {
          return <TabsContent value={tab.id}>{tab.content}</TabsContent>;
        })}
      </Tabs>
    </div>
  );
}

function BattingScore({
  team,
  ballEvents,
  isCurrentBatting,
}: {
  team: TeamWithPlayers;
  ballEvents: BallEvent[];
  isCurrentBatting?: boolean;
}) {
  return (
    <>
      {!isCurrentBatting && <p>Yet to bat</p>}
      {team.players.map((player) => {
        const outBy = ballEvents
          .filter((event) => event.batsmanId === player.id)
          .map((event) => {
            const { type, bowlerId } = event;

            if (type === "-1") return bowlerId;
          });

        const legalEvents = ballEvents.filter(
          (ball) => ball.type !== "-2" && player.id === ball.batsmanId,
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
            ?.filter((event) => event.batsmanId === player.id)
            .map((event) => event.type as EventType),
        );

        return (
          <div>
            <p>
              {player.name} {outBy}
            </p>
            <div className="space-x-2">
              <span>{runs}</span>
              <span>{totalBalls}</span>
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
