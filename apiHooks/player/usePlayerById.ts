import { Player } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { getPlayerById } from "@/services/player";

export function usePlayerById(id: Player["id"]) {
  const {
    data: player,
    isLoading: playerIsLoading,
    isFetching: playerIsFetching,
    refetch: playerRefetch,
    error: playerError,
  } = useQuery({
    queryKey: ["playerById", id],
    queryFn: () => getPlayerById(id),
  });

  return {
    player,
    isLoading: playerIsLoading,
    isFetching: playerIsFetching,
    refetch: playerRefetch,
    error: playerError,
  };
}
