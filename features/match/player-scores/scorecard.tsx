import { BallEvent, Player } from "@prisma/client";

import { calculateFallOfWickets } from "@/lib/utils";
import { MatchExtended } from "@/types";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Score from "./score";

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
      id: "1",
      name: firstBattingTeam.name,
      content: (
        <div className="space-y-2">
          <Score {...getScoreProps(firstBattingTeam.players, 0)} />
          <Score {...getScoreProps(secondBattingTeam.players, 0, true)} />
        </div>
      ),
    },
    {
      id: "2",
      name: secondBattingTeam.name,
      content: (
        <div className="space-y-2">
          <Score {...getScoreProps(secondBattingTeam.players, 1)} />
          <Score {...getScoreProps(firstBattingTeam.players, 1, true)} />
        </div>
      ),
    },
  ];

  return (
    <Tabs defaultValue={tabs[0].id} className="h-full overflow-y-auto">
      <div className="sticky top-0 z-10 mx-auto w-full max-w-7xl bg-white pb-2 max-[1300px]:px-2">
        <TabsList className="divide-x divide-foreground/40 px-0 max-sm:w-full">
          {tabs.map((tab) => (
            <div className="px-1 max-sm:w-1/2 sm:min-w-32" key={tab.id}>
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="w-full px-2 text-sm font-semibold"
              >
                <p className="w-full truncate">{tab.name}</p>
              </TabsTrigger>
            </div>
          ))}
        </TabsList>
      </div>
      {tabs.map((tab) => (
        <TabsContent
          key={tab.id}
          value={tab.id}
          className="mx-auto h-full w-full max-w-7xl"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}

export default Scorecard;
