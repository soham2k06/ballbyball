import { getEventsById } from "@/services/ballEvent/getEventsById";
import { useQuery } from "@tanstack/react-query";

export function useEventsById(id: string) {
  const {
    data: events,
    isLoading: eventsIsLoading,
    isFetching: eventsIsFetching,
    refetch: eventsRefetch,
    error: eventsError,
  } = useQuery({
    queryKey: ["eventsByMatchId", id],
    queryFn: () => getEventsById(id),
  });

  return {
    events,
    isLoading: eventsIsLoading,
    isFetching: eventsIsFetching,
    refetch: eventsRefetch,
    error: eventsError,
  };
}
