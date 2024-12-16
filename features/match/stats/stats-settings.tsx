import { Dispatch, SetStateAction, useState } from "react";

import Image from "next/image";

import { BallEvent, CurPlayer } from "@prisma/client";
import { BarChartBig, LineChart, ListOrdered, X } from "lucide-react";

import { useStatsOpenContext } from "@/contexts/stats-open-context";
import { saveBallEvents } from "@/lib/actions/ball-event";
import { updateMatch } from "@/lib/actions/match";
import { useActionMutate } from "@/lib/hooks";
import { cn, getOverStr, getScore } from "@/lib/utils";
import { CreateBallEventSchema } from "@/lib/validation/ball-event";
import { EventType, MatchExtended } from "@/types";

import {
  SelectBowler,
  SelectBatsman,
} from "@/features/match/players-selection";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import { TypographyH2, TypographyP } from "@/components/ui/typography";

import FullOverSummary from "./full-over-summary";
import OverStats from "./over-stats";
import PlayerRivalries from "./player-rivalries";
import StatsDrawerHeader from "./stats-drawer-header";
import TeamSelect from "./team-select";
import WormChart from "./worm-chart";

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    showRunrateChart,
    setShowRunrateChart,
    showOverSummaries,
    setShowOverSummaries,
    showWormChart,
    setShowWormChart,
    showNames,
    setShowNames,
    showPlayerRivalries,
    setShowPlayerRivalries,
  } = useStatsOpenContext();

  const [showSelectBatsman, setShowSelectBatsman] = useState(false);
  const [showSelectBowler, setShowSelectBowler] = useState(false);

  const [selectedTeam, setSelectedTeam] = useState<string>(
    match?.teams[0].name ?? "",
  );

  const { mutate: createBallEvent } = useActionMutate(saveBallEvents);
  const { mutate: updateMutate } = useActionMutate(updateMatch);

  const curTeam = match?.teams[match.curTeam];
  const opposingTeam = match?.teams[match.curTeam === 0 ? 1 : 0];

  const firstTeam = match?.teams[0];
  const secondTeam = match?.teams[1];

  const fTeamPlayerIds = firstTeam?.players.map((player) => player.id) || [];
  const sTeamPlayerIds = secondTeam?.players.map((player) => player.id) || [];

  const selectedTeamEvents = events.filter(
    (event) =>
      (selectedTeam === firstTeam?.name &&
        fTeamPlayerIds.includes(event.batsmanId)) ||
      (selectedTeam === secondTeam?.name &&
        sTeamPlayerIds.includes(event.batsmanId)),
  );

  const fTeamEvents = events
    .filter((event) => fTeamPlayerIds.includes(event.batsmanId))
    .map((event) => event.type as EventType);

  const sTeamEvents = events
    .filter((event) => sTeamPlayerIds.includes(event.batsmanId))
    .map((event) => event.type as EventType);

  const ballEventsObj = {
    [firstTeam?.name || ""]: fTeamEvents,
    [secondTeam?.name || ""]: sTeamEvents,
  };

  const {
    runs: runs1,
    totalBalls: totalBalls1,
    wickets: wickets1,
  } = getScore({ balls: fTeamEvents });

  const {
    runs: runs2,
    totalBalls: totalBalls2,
    wickets: wickets2,
  } = getScore({ balls: sTeamEvents });

  const { runRate } = getScore({
    balls: selectedTeamEvents.map((evt) => evt.type),
  });

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
      {/* Main drawer */}
      <Drawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        direction="right"
      >
        <DrawerTrigger asChild>
          <Button className="w-full">Stats & Settings</Button>
        </DrawerTrigger>
        {!match || !curTeam || !opposingTeam ? null : (
          <DrawerContent direction="right" className="p-2">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-4"
              onClick={() => setIsDrawerOpen(false)}
            >
              <X className="size-5" />
            </Button>
            <DrawerHeader className="text-left">
              <TypographyH2 className="text-2xl font-semibold tracking-tighter">
                Stats & Settings
              </TypographyH2>
            </DrawerHeader>
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
                  setIsDrawerOpen(false);
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
                  setIsDrawerOpen(false);
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
          </DrawerContent>
        )}
      </Drawer>

      {match && curTeam && (
        <>
          {/* Run rate chart */}
          <Drawer open={showRunrateChart} onOpenChange={setShowRunrateChart}>
            <DrawerContent>
              <div className="mx-auto w-full max-w-7xl">
                <StatsDrawerHeader
                  match={match}
                  selectedTeam={selectedTeam}
                  setSelectedTeam={setSelectedTeam}
                  runRate={runRate}
                />
                <OverStats
                  ballEvents={ballEventsObj[selectedTeam]}
                  totalOvers={match.overs}
                  runRate={runRate}
                />
              </div>
            </DrawerContent>
          </Drawer>

          {/* Over summaries */}
          <Drawer open={showOverSummaries} onOpenChange={setShowOverSummaries}>
            <DrawerContent>
              <DrawerHeader className="relative mb-2 flex items-center justify-between gap-2 pb-4 pt-6">
                <DrawerTitle className="text-xl">
                  <span className={cn({ "sr-only": !runRate })}>
                    CRR: {runRate}
                  </span>
                </DrawerTitle>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1">
                    <Checkbox
                      id="showNames"
                      checked={showNames}
                      onCheckedChange={() => setShowNames(!showNames)}
                    />
                    <Label htmlFor="showNames">Names</Label>
                  </div>
                  <TeamSelect
                    selectedTeam={selectedTeam}
                    setSelectedTeam={setSelectedTeam}
                    teams={match.teams}
                  />
                </div>
              </DrawerHeader>
              <FullOverSummary
                ballEvents={selectedTeamEvents}
                showNames={showNames}
                players={match.teams.flatMap((team) => team.players)}
              />
            </DrawerContent>
          </Drawer>

          {/* Worm chart */}
          <Drawer open={showWormChart} onOpenChange={setShowWormChart}>
            <DrawerContent>
              <DrawerHeader className="mb-2 pb-4 pt-6">
                <DrawerTitle className="space-x-4 text-center text-2xl">
                  <span className="text-sm text-muted-foreground">
                    {firstTeam?.name} {runs1}/{wickets1} (
                    {getOverStr(totalBalls1)})
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {secondTeam?.name} {runs2}/{wickets2} (
                    {getOverStr(totalBalls2)})
                  </span>
                </DrawerTitle>
              </DrawerHeader>
              <WormChart
                ballEvents={[
                  ballEventsObj[firstTeam?.name ?? ""],
                  ballEventsObj[secondTeam?.name ?? ""],
                ]}
                teams={match.teams}
                totalOvers={match.overs}
              />
            </DrawerContent>
          </Drawer>

          {/* Player Rivalries */}
          <Drawer
            open={showPlayerRivalries}
            onOpenChange={setShowPlayerRivalries}
          >
            <DrawerContent>
              <DrawerHeader className="mb-2 pb-4 pt-6">
                <div className="flex items-center justify-between gap-2">
                  <DrawerTitle className="text-xl">
                    Player Rivalries
                  </DrawerTitle>
                  <TeamSelect
                    selectedTeam={selectedTeam}
                    setSelectedTeam={setSelectedTeam}
                    teams={match.teams}
                  />
                </div>
                <DrawerDescription>
                  Click on rivalry to view more details
                </DrawerDescription>
              </DrawerHeader>
              <PlayerRivalries
                ballEvents={selectedTeamEvents}
                players={match.teams.flatMap((team) => team.players)}
              />
            </DrawerContent>
          </Drawer>
        </>
      )}
    </>
  );
}

export default StatsAndSettings;
