import { Dispatch, SetStateAction } from "react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";

interface Team {
  index: 0 | 1;
}

interface TeamTabsProps {
  selectedTeam: Team;
  setSelectedTeam: Dispatch<SetStateAction<Team>>;
  teams: { id: string; name: string }[];
}

function TeamTabs({ selectedTeam, setSelectedTeam, teams }: TeamTabsProps) {
  return (
    <Tabs
      value={String(selectedTeam.index)}
      onValueChange={(val) =>
        setSelectedTeam({ index: parseInt(val) as 0 | 1 })
      }
      className="w-fit rounded-lg bg-secondary p-1"
    >
      <TabsList>
        {teams.map((team, i) => (
          <TabsTrigger value={String(i)} key={team.id}>
            {team.name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

export default TeamTabs;
