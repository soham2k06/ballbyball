import { useQuery } from "@tanstack/react-query";
import { getMatchById } from "@/services/match";

export function useMatchById(id: string) {
  const {
    data: match,
    isLoading: matchIsLoading,
    isFetching: matchIsFetching,
    refetch: matchRefetch,
    error: matchError,
    isSuccess,
  } = useQuery({
    queryKey: ["matchById", id],
    queryFn: () => getMatchById(id),
  });

  return {
    match,
    matchIsLoading,
    matchIsFetching,
    matchRefetch,
    matchError,
    isSuccess,
  };
}
