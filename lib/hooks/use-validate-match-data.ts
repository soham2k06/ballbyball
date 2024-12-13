import { useState, useEffect } from "react";

import { TeamWithPlayers } from "@/types";

function useValidateMatchData(teams: (TeamWithPlayers | undefined)[]) {
  const [containsSamePlayer, setContainsSamePlayer] = useState(false);
  const [isDifferentPlayerLengthTeams, setIsDifferentPlayerLengthTeams] =
    useState(false);

  const team1Ids = (teams[0]?.players ?? []).map((player) => player.id);
  const team2Ids = (teams[1]?.players ?? []).map((player) => player.id);

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
