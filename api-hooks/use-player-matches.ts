import { useQuery } from "@tanstack/react-query";

import { getPlayerMatches } from "@/services/get-player-matches";

export function usePlayerMatches(id: string | undefined) {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["playerMatches", id],
    queryFn: () => getPlayerMatches(id),
    enabled: !!id,
  });

  return {
    data,
    isLoading,
    isFetching,
    error,
  };
}
