import { Dispatch, SetStateAction } from "react";

import { cn } from "@/lib/utils";
import { MatchExtended } from "@/types";

import { DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

import TeamSelect from "./team-select";

interface StatsDrawerHeaderProps {
  runRate?: number;
  selectedTeam: string;
  setSelectedTeam: Dispatch<SetStateAction<string>>;
  match: MatchExtended;
}

function StatsDrawerHeader({
  match,
  runRate,
  selectedTeam,
  setSelectedTeam,
}: StatsDrawerHeaderProps) {
  return (
    <DrawerHeader className="relative mb-2 flex items-center justify-between gap-2 pb-4 pt-6">
      <DrawerTitle className="text-xl">
        <span className={cn({ "sr-only": !runRate })}>CRR: {runRate}</span>
      </DrawerTitle>
      <TeamSelect
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        teams={match.teams}
      />
    </DrawerHeader>
  );
}

export default StatsDrawerHeader;
