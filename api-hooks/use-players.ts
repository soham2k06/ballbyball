import { useQuery } from "@tanstack/react-query";

import {
  getAllPlayers,
  getPlayerBySortedPerformance,
} from "@/lib/actions/player";

export function usePlayers() {
  const {
    data: players = [],
    isFetching,
    isFetched,
  } = useQuery({
    queryKey: ["players"],
    queryFn: () => getAllPlayers(),
  });

  return { players, isLoading: isFetching, isFetched };
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
