import { MatchExtended } from "@/types";
import { DrawerHeader, DrawerTitle } from "../ui/drawer";
import TeamTabs from "./TeamTabs";
import { Dispatch, SetStateAction } from "react";

interface StatsDrawerHeaderProps {
  runRate: number;
  selectedTeam: {
    index: number;
    name: string;
  };
  setSelectedTeam: Dispatch<SetStateAction<{ index: number; name: string }>>;
  match: MatchExtended;
}

function StatsDrawerHeader({
  match,
  runRate,
  selectedTeam,
  setSelectedTeam,
}: StatsDrawerHeaderProps) {
  return (
    <DrawerHeader className="relative mb-2 flex items-center justify-end pb-4 pt-6">
      <DrawerTitle className="absolute left-1/2 -translate-x-1/2 text-center text-2xl">
        CRR: {runRate}
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
