import { getTopPerformants } from "@/services/match/getTopPerformants";
import { PlayerPerformance } from "@/types";
import { useQuery } from "@tanstack/react-query";

export type TopPerformantPayload = {
  id: string | null | undefined;
  payload: {
    playersPerformance: PlayerPerformance[];
    team1: string;
    team2: string;
  };
};

export function useTopPerformants(payload: TopPerformantPayload) {
  const { data: topPerformants, isLoading } = useQuery({
    queryKey: ["top-performants"],
    queryFn: () => getTopPerformants(payload),
  });

  return { topPerformants, isLoading };
}
