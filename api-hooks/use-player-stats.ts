import { useSearchParams } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { getPlayerStats } from "@/services/get-player-stats";

export function usePlayerStats(id: string | undefined) {
  const sp = useSearchParams();
  const userRef = sp.get("user");

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["playerStats", id, userRef],
    queryFn: () => getPlayerStats(id, userRef),
    enabled: !!id,
  });

  return {
    data,
    isLoading,
    isFetching,
    error,
  };
}
