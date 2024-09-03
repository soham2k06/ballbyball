import { BallEvent, Player } from "@prisma/client";

import { MatchExtended } from "@/types";
import { calculateFallOfWickets, processTeamName } from "@/lib/utils";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";

import Score from "./Score";

interface ScorecardProps {
  match: MatchExtended | undefined;
  ballEvents: BallEvent[];
}

function Scorecard({ match, ballEvents }: ScorecardProps) {
  if (!match) return null;

  const teams = match.teams;

  const curTeam = match.curTeam;

  const isInSecondInning = !new Set(
    match.teams[curTeam].players.map((player) => player.id),
  ).has(ballEvents[0]?.batsmanId);

  const firstBattingTeam = teams[0];
  const secondBattingTeam = teams[1];
  const hasYetToBatTeam = isInSecondInning ? null : 1;

  function getScoreProps(
    players: Player[],
    i: number,
    isBowlingScore?: boolean,
  ) {
    const ballEventsToPass = ballEvents.filter((event) =>
      players
        .map(({ id }) => id)
        .includes(event[isBowlingScore ? "bowlerId" : "batsmanId"]),
    );

    const selectedTeam = teams[i];

    const fallOfWickets = !isBowlingScore
      ? []
      : calculateFallOfWickets(ballEventsToPass, selectedTeam.players);

    return {
      ballEvents: ballEventsToPass,
      isBowlingScore,
      players,
      hasYetToBatTeam,
      fallOfWickets,
      teamIndex: i,
      teams,
    };
  }

  const tabs = [
    {
      id: "1-bat",
      name: `${processTeamName(firstBattingTeam.name)} - Bat`,
      content: <Score {...getScoreProps(firstBattingTeam.players, 0)} />,
    },
    {
      id: "2-bowl",
      name: `${processTeamName(secondBattingTeam.name)} - Bowl`,
      content: <Score {...getScoreProps(secondBattingTeam.players, 0, true)} />,
    },
    {
      id: "2-bat",
      name: `${processTeamName(secondBattingTeam.name)} - Bat`,
      content: <Score {...getScoreProps(secondBattingTeam.players, 1)} />,
    },
    {
      id: "1-bowl",
      name: `${processTeamName(firstBattingTeam.name)} - Bowl`,
      content: <Score {...getScoreProps(firstBattingTeam.players, 1, true)} />,
    },
  ];

  return (
    <Tabs defaultValue="1-bat">
      <div className="px-2">
        <TabsList className="justify-normal divide-x divide-foreground/40 px-0 max-md:w-full">
          {tabs.map((tab) => (
            <div className="w-full px-1" key={tab.id}>
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="w-full px-2 text-xs font-semibold md:text-sm"
              >
                {tab.name}
              </TabsTrigger>
            </div>
          ))}
        </TabsList>
      </div>
      <ScrollArea className="h-[calc(100dvh-180px)]">
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            {tab.content}
          </TabsContent>
        ))}
      </ScrollArea>
    </Tabs>
  );
}

export default Scorecard;
