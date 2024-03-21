import { Team } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { getTeamById } from "@/services/team/getTeamById";

export function useTeamById(id: Team["id"]) {
  const {
    data: team,
    isLoading: areTeamLoading,
    isFetching: areTeamFetching,
    refetch: refetchTeam,
    error: teamError,
  } = useQuery({
    queryKey: ["teamById", id],
    queryFn: () => getTeamById(id),
    enabled: !!id,
  });

  if (teamError) throw new Error(teamError.message);

  return {
    team,
    areTeamLoading,
    areTeamFetching,
    refetchTeam,
    teamError,
  };
}
