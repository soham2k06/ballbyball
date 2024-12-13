import { useSearchParams } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { getRecords } from "@/services/get-records";

export function useRecords({
  matches,
  date,
}: {
  matches: string | null;
  date: string | null;
}) {
  const sp = useSearchParams();
  const user = sp.get("user");

  const {
    data: records,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["records", user, matches, date],
    queryFn: () => getRecords({ user, matches: matches ?? "10", date }),
  });

  return {
    records,
    isLoading,
    isFetching,
    error,
  };
}
