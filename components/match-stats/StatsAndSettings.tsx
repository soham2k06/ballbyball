import { Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";
import { BallEvent, CurPlayer } from "@prisma/client";
import { BarChartBig, LineChart, ListOrdered } from "lucide-react";

import { EventType, MatchExtended } from "@/types";
import { CreateBallEventSchema } from "@/lib/validation/ballEvent";

import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "../ui/sheet";
import { TypographyH2, TypographyP } from "../ui/typography";
import { Button } from "../ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer";

import { SelectBowler, SelectBatsman } from "../players-selection";
import OverStats from "./OverStats";
import FullOverSummary from "./FullOverSummary";
import { useStatsOpenContext } from "@/contexts/StatsOpenContext";
import StatsDrawerHeader from "./StatsDrawerHeader";
import WormChart from "./WormChart";
import { getOverStr, getScore } from "@/lib/utils";
import { updateMatch } from "@/lib/actions/match";
import { useActionMutate } from "@/lib/hooks";
import { saveBallEvents } from "@/lib/actions/ball-event";

interface StatsAndSettingsProps {
  match: MatchExtended | undefined;
  events: BallEvent[] | CreateBallEventSchema[];
  curPlayers: CurPlayer[];
  setCurPlayers: Dispatch<SetStateAction<CurPlayer[]>>;
}

function StatsAndSettings({
  curPlayers,
  events,
  match,
  setCurPlayers,
}: StatsAndSettingsProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const {
    setShowRunrateChart,
    showRunrateChart,
    setShowOverSummaries,
    showOverSummaries,
    showWormChart,
    setShowWormChart,
  } = useStatsOpenContext();

  const [showSelectBatsman, setShowSelectBatsman] = useState(false);
  const [showSelectBowler, setShowSelectBowler] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState<{
    index: 0 | 1;
  }>({ index: 0 });

  const { mutate: createBallEvent } = useActionMutate(saveBallEvents);
  const { mutate: updateMutate } = useActionMutate(updateMatch);

  const curTeam = match?.teams[match.curTeam];
  const opposingTeam = match?.teams[match.curTeam === 0 ? 1 : 0];

  const playerIds = curTeam?.players.map((player) => player.id) || [];

  const fTeamEvents = events
    .filter((event) => playerIds.includes(event.batsmanId))
    .map((event) => event.type as EventType);

  const sTeamEvents = events
    .filter((event) => playerIds.includes(event.bowlerId))
    .map((event) => event.type as EventType);

  const ballEventsArr =
    match?.curTeam === 0
      ? [fTeamEvents, sTeamEvents]
      : [sTeamEvents, fTeamEvents];

  const {
    runs: runs1,
    totalBalls: totalBalls1,
    wickets: wickets1,
  } = getScore(fTeamEvents);

  const {
    runs: runs2,
    totalBalls: totalBalls2,
    wickets: wickets2,
  } = getScore(sTeamEvents);

  const { runRate } = getScore(ballEventsArr[selectedTeam.index]);

  function handleSelectPlayer(payload: CurPlayer[], onSuccess?: () => void) {
    if (!match?.id) return;

    setCurPlayers(payload);
    updateMutate(
      { id: match.id, curPlayers: payload },
      {
        onSuccess: () => {
          onSuccess?.();
          if (events.length)
            createBallEvent(
              events.map((event) => ({ ...event, matchId: match.id })),
            );
        },
      },
    );
  }

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button className="w-full">Stats & Settings</Button>
        </SheetTrigger>
        {!match || !curTeam || !opposingTeam ? null : (
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
              events={events}
              isManualMode
              handleSelectPlayer={(payload) => {
                handleSelectPlayer(payload, () => {
                  setShowSelectBatsman(false);
                  setIsSheetOpen(false);
                });
              }}
              team={curTeam}
              allowSinglePlayer={match.allowSinglePlayer}
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
              isManualMode
              handleSelectPlayer={(payload) => {
                handleSelectPlayer(payload, () => {
                  setShowSelectBatsman(false);
                  setIsSheetOpen(false);
                });
              }}
              team={opposingTeam}
            />
            <TypographyP className="mb-2 text-sm font-bold uppercase text-muted-foreground">
              Stats
            </TypographyP>

            <div className="space-y-2">
              <Button
                className="w-full space-x-2"
                onClick={() => setShowWormChart(true)}
              >
                <LineChart />
                <span>Worm Chart</span>
              </Button>
              <Button
                className="w-full space-x-2"
                onClick={() => setShowRunrateChart(true)}
              >
                <BarChartBig /> <span>Run rate chart</span>
              </Button>
              <Button
                className="w-full space-x-2"
                onClick={() => setShowOverSummaries(true)}
              >
                <ListOrdered />
                <span>Over Summaries</span>
              </Button>
            </div>
          </SheetContent>
        )}
      </Sheet>
      {match && curTeam && opposingTeam && (
        <>
          <Drawer open={showRunrateChart} onOpenChange={setShowRunrateChart}>
            <DrawerContent>
              <StatsDrawerHeader
                match={match}
                selectedTeam={selectedTeam}
                setSelectedTeam={setSelectedTeam}
                runRate={runRate}
              />
              <OverStats
                ballEvents={ballEventsArr[selectedTeam.index]}
                totalOvers={match.overs}
                runRate={runRate}
              />
            </DrawerContent>
          </Drawer>
          <Drawer open={showOverSummaries} onOpenChange={setShowOverSummaries}>
            <DrawerContent>
              <StatsDrawerHeader
                match={match}
                selectedTeam={selectedTeam}
                setSelectedTeam={setSelectedTeam}
                runRate={runRate}
              />
              <FullOverSummary ballEvents={ballEventsArr[selectedTeam.index]} />
            </DrawerContent>
          </Drawer>
          <Drawer open={showWormChart} onOpenChange={setShowWormChart}>
            <DrawerContent>
              <DrawerHeader className="mb-2 pb-4 pt-6">
                <DrawerTitle className="space-x-4 text-center text-2xl">
                  <span className="text-sm text-muted-foreground">
                    {curTeam.name} {runs1}/{wickets1} ({getOverStr(totalBalls1)}
                    )
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {opposingTeam.name} {runs2}/{wickets2} (
                    {getOverStr(totalBalls2)})
                  </span>
                </DrawerTitle>
              </DrawerHeader>
              <WormChart
                ballEvents={ballEventsArr}
                teams={match.teams}
                totalOvers={match.overs}
              />
            </DrawerContent>
          </Drawer>
        </>
      )}
    </>
  );
}

export default StatsAndSettings;
