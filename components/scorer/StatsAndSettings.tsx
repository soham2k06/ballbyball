import { Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";
import { BallEvent, CurPlayer } from "@prisma/client";
import { BarChartBig, ListOrdered, Pencil } from "lucide-react";

import { EventType, MatchWithTeams } from "@/types";
import { CreateBallEventSchema } from "@/lib/validation/ballEvent";

import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "../ui/sheet";
import { TypographyH2, TypographyP } from "../ui/typography";
import { Button } from "../ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";

import { SelectBowler, SelectBatsman } from "../players-selection";
import OverStats from "./OverStats";
import FullOverSummary from "./FullOverSummary";

interface StatsAndSettingsProps {
  runRate: number;
  chartSummaryData: { runs: number }[];
  overSummaries: EventType[][];
  match: MatchWithTeams;
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
        <Button className="w-full">Stats & Settings</Button>
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
          className="mb-2 w-full space-x-2"
          onClick={() => setShowSelectBatsman(true)}
        >
          <Image
            src="/icons/bat.png"
            alt="bat icon"
            width={24}
            height={24}
            className="invert dark:invert-0"
          />
          <span>Select Batsman</span>
        </Button>
        <SelectBatsman
          open={showSelectBatsman}
          setOpen={setShowSelectBatsman}
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
        <Button
          className="w-full space-x-2"
          onClick={() => setShowSelectBowler(true)}
        >
          <Image
            src="/icons/ball.png"
            alt="ball icon"
            width={24}
            height={24}
            className="invert dark:invert-0"
          />
          <span>Select Bowler</span>
        </Button>
        <SelectBowler
          open={showSelectBowler}
          setOpen={setShowSelectBowler}
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
        <TypographyP className="mb-2 text-sm font-bold uppercase text-muted-foreground">
          Settings
        </TypographyP>
        <Button className="w-full space-x-2">
          <Pencil /> <span>Match Settings</span>
        </Button>
      </SheetContent>
    </Sheet>
  );
}

export default StatsAndSettings;
