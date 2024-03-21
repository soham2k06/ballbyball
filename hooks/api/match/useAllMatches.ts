import { useQuery } from "@tanstack/react-query";
import { getAllMatches } from "@/services/match/getAllMatches";

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
