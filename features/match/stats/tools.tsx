import { Dispatch, SetStateAction } from "react";

import { BallEvent, CurPlayer } from "@prisma/client";

import { abbreviateEntity } from "@/lib/utils";
import { CreateBallEventSchema } from "@/lib/validation/ball-event";
import { MatchExtended } from "@/types";

import Scorecard from "@/features/match/player-scores/scorecard";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import StatsAndSettings from "./stats-settings";

interface ToolsProps {
  match: MatchExtended | undefined;
  events: BallEvent[] | CreateBallEventSchema[];
  curPlayers: CurPlayer[];
  setCurPlayers: Dispatch<SetStateAction<CurPlayer[]>>;
  showScorecard: boolean;
  setShowScorecard: Dispatch<SetStateAction<boolean>>;
}

function Tools({
  curPlayers,
  events,
  match,
  setCurPlayers,
  showScorecard,
  setShowScorecard,
}: ToolsProps) {
  const processConditionally = (name: string) =>
    name.length > 10 ? abbreviateEntity(name) : name;

  const team1Name = processConditionally(match?.teams[0]?.name ?? "");
  const team2Name = processConditionally(match?.teams[1]?.name ?? "");

  return (
    <div className="flex w-full items-center gap-2 text-lg text-muted-foreground">
      <StatsAndSettings
        events={events}
        match={match}
        curPlayers={curPlayers}
        setCurPlayers={setCurPlayers}
      />
      <Drawer open={showScorecard} onOpenChange={setShowScorecard}>
        <DrawerTrigger asChild>
          <Button className="w-full">Scorecard</Button>
        </DrawerTrigger>
        <DrawerContent className="max-h-[95dvh] overflow-y-hidden">
          <DrawerHeader className="sm:mb-2 sm:py-4">
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
