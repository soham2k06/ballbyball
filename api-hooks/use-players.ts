import {
  getAllPlayers,
  getPlayerBySortedPerformance,
} from "@/lib/actions/player";
import { useQuery } from "@tanstack/react-query";

export function usePlayers() {
  const {
    data: players = [],
    isLoading,
    isFetched,
  } = useQuery({
    queryKey: ["players"],
    queryFn: () => getAllPlayers(),
  });

  return { players, isLoading, isFetched };
}

export function useSortedPlayersByPerformance(options?: { enabled?: boolean }) {
  const {
    data: sortedPlayers = [],
    isFetched,
    refetch,
    isFetching,
  } = useQuery({
    ...options,
    queryKey: ["sorted-players-by-performance"],
    queryFn: () => getPlayerBySortedPerformance(),
  });

  return {
    sortedPlayers,
    isLoading: isFetching,
    isSorted: isFetched,
    sort: refetch,
  };
}
