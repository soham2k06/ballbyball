import { useTeamById } from "@/apiHooks/team";
import { useState, useEffect } from "react";

function useValidateMatchData(teamIds: string[]) {
  const [containsSamePlayer, setContainsSamePlayer] = useState(false);
  const [isDifferentPlayerLengthTeams, setIsDifferentPlayerLengthTeams] =
    useState(false);

  const { team: team1 } = useTeamById(teamIds[0]);
  const { team: team2 } = useTeamById(teamIds[1]);

  const team1Ids = team1?.players.map((player) => player.id) ?? [];
  const team2Ids = team2?.players.map((player) => player.id) ?? [];

  useEffect(() => {
    const idSet = new Set(team2Ids);
    for (const id of team1Ids) {
      if (idSet.has(id)) {
        setContainsSamePlayer(true);
        return;
      }
    }
    setContainsSamePlayer(false);
  }, [team1Ids, team2Ids]);

  useEffect(() => {
    setIsDifferentPlayerLengthTeams(team1Ids.length !== team2Ids.length);
  }, [team1Ids, team2Ids]);

  return { isDifferentPlayerLengthTeams, containsSamePlayer };
}

export { useValidateMatchData };
