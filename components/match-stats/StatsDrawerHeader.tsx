import { MatchExtended } from "@/types";
import { DrawerHeader, DrawerTitle } from "../ui/drawer";
import TeamTabs from "./TeamTabs";
import { Dispatch, SetStateAction } from "react";
import { cn } from "@/lib/utils";

interface StatsDrawerHeaderProps {
  runRate?: number;
  selectedTeam: { index: 0 | 1 };
  setSelectedTeam: Dispatch<SetStateAction<{ index: 0 | 1 }>>;
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
      <TeamTabs
        selectedTeam={selectedTeam}
        setSelectedTeam={setSelectedTeam}
        teams={match.teams}
      />
    </DrawerHeader>
  );
}

export default StatsDrawerHeader;
