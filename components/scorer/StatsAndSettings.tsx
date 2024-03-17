import { Dispatch, SetStateAction, useState } from "react";

import { BarChartBig, ListOrdered } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { TypographyH2, TypographyP } from "../ui/typography";
import { Button } from "../ui/button";
import OverStats from "./OverStats";
import { EventType } from "@/types";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import FullOverSummary from "./FullOverSummary";
import SelectBatsman from "../players-selection/SelectBatsman";
import { BallEvent, CurPlayer, Match } from "@prisma/client";
import { CreateBallEventSchema } from "@/lib/validation/ballEvent";
import SelectBowler from "../players-selection/SelectBowler";

interface StatsAndSettingsProps {
  runRate: number;
  chartSummaryData: { runs: number }[];
  overSummaries: EventType[][];
  match: Match;
  events: BallEvent[] | CreateBallEventSchema[];
  curPlayers: CurPlayer[];
  setCurPlayers: Dispatch<SetStateAction<CurPlayer[]>>;
  handleSave: (_: unknown, updatedCurPlayers?: CurPlayer[]) => void;
}

function StatsAndSettings({
  chartSummaryData,
  runRate,
  overSummaries,
  curPlayers,
  events,
  handleSave,
  match,
  setCurPlayers,
}: StatsAndSettingsProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [showSelectBatsman, setShowSelectBatsman] = useState(false);
  const [showSelectBowler, setShowSelectBowler] = useState(false);

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button className="w-full">Stats & Selection</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className="text-left">
          <TypographyH2 className="text-2xl font-semibold tracking-tighter">
            Stats & Settings
          </TypographyH2>
        </SheetHeader>

        <TypographyP className="mb-2 text-sm font-bold uppercase text-muted-foreground">
          Manual Selection
        </TypographyP>

        <Button
          className="mb-2 w-full"
          onClick={() => setShowSelectBatsman(true)}
        >
          Select Batsman
        </Button>
        <SelectBatsman
          open={showSelectBatsman}
          curPlayers={curPlayers}
          setCurPlayers={setCurPlayers}
          match={match}
          events={events}
          handleSave={(_, payload) => {
            handleSave(0, payload);
            setShowSelectBatsman(false);
            setIsSheetOpen(false);
          }}
          isManualMode
        />
        <Button className="w-full" onClick={() => setShowSelectBowler(true)}>
          Select Bowler
        </Button>
        <SelectBowler
          open={showSelectBowler}
          curPlayers={curPlayers}
          setCurPlayers={setCurPlayers}
          match={match}
          handleSave={(_, payload) => {
            handleSave(0, payload);
            setShowSelectBatsman(false);
            setIsSheetOpen(false);
          }}
          isManualMode
        />

        <TypographyP className="mb-2 text-sm font-bold uppercase text-muted-foreground">
          Stats
        </TypographyP>
        <Drawer>
          <DrawerTrigger asChild>
            <Button className="mb-2 w-full space-x-2">
              <BarChartBig /> <span>Run rate chart</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="mb-2 pb-4 pt-6 ">
              <DrawerTitle className="text-center text-2xl">
                CRR: {runRate}
              </DrawerTitle>
            </DrawerHeader>
            <OverStats chartSummaryData={chartSummaryData} />
          </DrawerContent>
        </Drawer>

        <Drawer>
          <DrawerTrigger asChild>
            <Button className="w-full space-x-2">
              <ListOrdered />
              <span>Over Summaries</span>
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="mb-2 pb-4 pt-6 ">
              <DrawerTitle className="text-center text-2xl">
                CRR: {runRate}
              </DrawerTitle>
            </DrawerHeader>
            <FullOverSummary overSummaries={overSummaries} />
          </DrawerContent>
        </Drawer>
      </SheetContent>
    </Sheet>
  );
}

export default StatsAndSettings;
