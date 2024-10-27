import { useSearchParams } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { getRecords } from "@/services/get-records";

export function useRecords() {
  const sp = useSearchParams();
  const user = sp.get("user");

  const {
    data: records,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["records", user],
    queryFn: () => getRecords({ user }),
  });

  return {
    records,
    isLoading,
    isFetching,
    error,
  };
}
