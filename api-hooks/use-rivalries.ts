import { useSearchParams } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { getRivalries, GetRivalriesParams } from "@/services/get-rivalries";

export function useRivalries({
  player,
  batsman,
  bowler,
  all,
  date,
}: Omit<GetRivalriesParams, "user">) {
  const sp = useSearchParams();
  const userRef = sp.get("user");

  const {
    data: rivalries,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["rivalries", batsman, bowler, player, all, date, userRef],
    queryFn: () =>
      getRivalries({ player, batsman, bowler, all, date, user: userRef }),
    enabled: !!player || !!batsman || !!bowler || !!all,
  });

  return {
    rivalries,
    isLoading,
    isFetching,
    error,
  };
}
