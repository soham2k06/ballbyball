import { useQuery } from "@tanstack/react-query";
import { getAllPlayers } from "@/services/player";

export function useAllPlayers() {
  const {
    data: players,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["allPlayers"],
    queryFn: getAllPlayers,
  });

  return { players, isLoading, isFetching, refetch };
}
