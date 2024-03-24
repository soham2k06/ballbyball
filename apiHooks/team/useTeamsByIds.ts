import { Team } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { getTeamsById } from "@/services/team";

export function useTeamsByIds(ids: Team["id"][][]) {
  const {
    data: teams,
    isLoading: areTeamsLoading,
    isFetching: areTeamsFetching,
    refetch: refetchTeams,
    error: teamsError,
  } = useQuery({
    queryKey: ["teamsByIds", ids],
    queryFn: () => getTeamsById(ids),
    enabled: ids && !!ids.length && ids.some((id) => !!id),
  });

  if (teamsError) throw new Error(teamsError.message);

  return {
    teams,
    areTeamsLoading,
    areTeamsFetching,
    refetchTeams,
    teamsError,
  };
}
