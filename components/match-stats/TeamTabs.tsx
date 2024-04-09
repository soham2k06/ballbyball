import { Dispatch, SetStateAction } from "react";
import { Button } from "../ui/button";

interface Team {
  index: number;
  name: string;
}

interface TeamTabsProps {
  selectedTeam: Team;
  setSelectedTeam: Dispatch<SetStateAction<Team>>;
  teams: { id: string; name: string }[];
}

function TeamTabs({ selectedTeam, setSelectedTeam, teams }: TeamTabsProps) {
  return (
    <ul
      defaultValue={selectedTeam.name}
      className="m-2 w-fit rounded-lg bg-secondary p-1"
    >
      <li>
        {teams?.map((team, i) => (
          <Button
            variant={selectedTeam.name === team.name ? "default" : "secondary"}
            size="sm"
            key={team.id}
            onClick={() => setSelectedTeam({ index: i, name: team.name })}
          >
            {team.name}
          </Button>
        ))}
      </li>
    </ul>
  );
}

export default TeamTabs;
