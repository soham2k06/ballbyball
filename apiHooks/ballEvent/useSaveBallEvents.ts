import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { saveBallEvents as saveBallEventsAPI } from "@/services/ballEvent";

export function useSaveBallEvents() {
  const queryClient = useQueryClient();

  const { mutate: createBallEvent, isPending } = useMutation({
    mutationFn: saveBallEventsAPI,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["eventsByMatchId"] }),
    onError: (err) => toast.error(err.message),
  });

  return { createBallEvent, isPending };
}
