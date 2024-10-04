import { useSearchParams } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { getRecords } from "@/services/get-records";

export function useRecords({ recordType }: { recordType: string }) {
  const sp = useSearchParams();
  const user = sp.get("user");
  const date = sp.get("date");

  const {
    data: records,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["records", date, user, recordType],
    queryFn: () => getRecords({ user, date, recordType }),
  });

  return {
    records,
    isLoading,
    isFetching,
    error,
  };
}
