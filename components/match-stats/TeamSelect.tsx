import { Dispatch, SetStateAction } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface TeamSelectProps {
  selectedTeam: string;
  setSelectedTeam: Dispatch<SetStateAction<string>>;
  teams: { id: string; name: string }[];
}

function TeamSelect({ selectedTeam, setSelectedTeam, teams }: TeamSelectProps) {
  return (
    <Select
      value={selectedTeam}
      onValueChange={(val) => {
        setSelectedTeam(val);
      }}
    >
      <SelectTrigger className="w-fit">
        <SelectValue>{selectedTeam}</SelectValue>
      </SelectTrigger>
      <SelectContent align="end">
        {teams.map((team) => (
          <SelectItem value={team.name} key={team.name}>
            {team.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default TeamSelect;
