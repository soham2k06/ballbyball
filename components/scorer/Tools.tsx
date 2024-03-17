import { EventType } from "@/types";
import { Button } from "../ui/button";

import StatsAndSettings from "./StatsAndSettings";
import { BallEvent, CurPlayer, Match } from "@prisma/client";
import { CreateBallEventSchema } from "@/lib/validation/ballEvent";
import { Dispatch, SetStateAction } from "react";

interface ToolsProps {
  runRate: number;
  chartSummaryData: { runs: number }[];
  overSummaries: EventType[][];

  match: Match;
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
      <Button className="w-full">Scorecard</Button>
    </div>
  );
}

export default Tools;
