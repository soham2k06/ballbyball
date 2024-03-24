import { useQuery } from "@tanstack/react-query";
import { getEventsByMatchId } from "@/services/ballEvent";

export function useEventsByMatchId(id: string) {
  const {
    data: events,
    isLoading: eventsIsLoading,
    isFetching: eventsIsFetching,
    refetch: eventsRefetch,
    error: eventsError,
  } = useQuery({
    queryKey: ["eventsByMatchId", id],
    queryFn: () => getEventsByMatchId(id),
  });

  return {
    events,
    isLoading: eventsIsLoading,
    isFetching: eventsIsFetching,
    refetch: eventsRefetch,
    error: eventsError,
  };
}
