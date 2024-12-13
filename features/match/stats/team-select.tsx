import { Dispatch, SetStateAction } from "react";

import { Select } from "@/components/ui/select";

interface TeamSelectProps {
  selectedTeam: string;
  setSelectedTeam: Dispatch<SetStateAction<string>>;
  teams: { id: string; name: string }[];
}

function TeamSelect({ selectedTeam, setSelectedTeam, teams }: TeamSelectProps) {
  return (
    <Select
      value={selectedTeam}
      onChange={(e) => {
        setSelectedTeam(e.target.value);
      }}
      className="w-fit"
    >
      {teams.map((team) => (
        <option key={team.id} value={team.name}>
          {team.name}
        </option>
      ))}
    </Select>
  );
}

export default TeamSelect;
