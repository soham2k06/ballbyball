import { getAllMatches } from "@/services/match/getAllMatches";
import { useQuery } from "@tanstack/react-query";

export function useAllMatches() {
  const {
    data: matches,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["allMatches"],
    queryFn: getAllMatches,
  });

  return { matches, isLoading, isFetching, refetch };
}
