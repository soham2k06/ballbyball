import { useQuery } from "@tanstack/react-query";
import { getPlayerStats } from "@/services/player/getPlayerStats";

export function usePlayerStats(id: string | undefined) {
  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["playerStats", id],
    queryFn: () => getPlayerStats(id),
    enabled: !!id,
  });

  return {
    data,
    isLoading,
    isFetching,
    error,
  };
}
