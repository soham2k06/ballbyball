import { useQuery } from "@tanstack/react-query";
import { getAllTeams } from "@/services/team/getAllTeams";

export function useAllTeams() {
  const {
    data: allTeams,
    isLoading,
    isFetching,
    refetch,
    error,
  } = useQuery({
    queryKey: ["allTeams"],
    queryFn: getAllTeams,
  });

  if (error) throw new Error(error.message);

  return { allTeams, isLoading, isFetching, refetch, error };
}
