import { Dispatch, SetStateAction } from "react";
import { BallEvent, CurPlayer } from "@prisma/client";

import { EventType, MatchWithTeams } from "@/types";
import { CreateBallEventSchema } from "@/lib/validation/ballEvent";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Button } from "../ui/button";
import StatsAndSettings from "./StatsAndSettings";
import Scorecard from "../player-scores/ScoreCard";
import { processTeamName } from "@/lib/utils";

interface ToolsProps {
  runRate: number;
  chartSummaryData: { runs: number }[];
  overSummaries: EventType[][];

  match: MatchWithTeams;
  events: BallEvent[] | CreateBallEventSchema[];
  curPlayers: CurPlayer[];
  setCurPlayers: Dispatch<SetStateAction<CurPlayer[]>>;
  handleSave: (_: unknown, updatedCurPlayers?: CurPlayer[]) => void;
}

function Tools({
  chartSummaryData,
  overSummaries,
  runRate,
  curPlayers,
  events,
  handleSave,
  match,
  setCurPlayers,
}: ToolsProps) {
  if (!match || !match.teams) return;

  const processConditionally = (name: string) =>
    name.length > 10 ? processTeamName(name) : name;

  const team1Name = processConditionally(match?.teams[0]?.name);
  const team2Name = processConditionally(match?.teams[1]?.name);

  return (
    <div className="flex w-full items-center gap-2 rounded-md bg-muted p-2 text-lg text-muted-foreground">
      <StatsAndSettings
        chartSummaryData={chartSummaryData}
        overSummaries={overSummaries}
        runRate={runRate}
        events={events}
        handleSave={handleSave}
        match={match}
        curPlayers={curPlayers}
        setCurPlayers={setCurPlayers}
      />
      <Drawer>
        <DrawerTrigger asChild>
          <Button className="w-full">Scorecard</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader className="mb-2 pb-4 pt-6 ">
            <DrawerTitle className="text-center text-2xl">
              {team1Name} vs {team2Name}
            </DrawerTitle>
          </DrawerHeader>
          <Scorecard ballEvents={events as BallEvent[]} match={match} />
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export default Tools;
