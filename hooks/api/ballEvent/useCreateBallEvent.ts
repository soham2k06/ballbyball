import { createBallEvent as createBallEventAPI } from "@/services/ballEvent/createBallEvent";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreateBallEvent() {
  const queryClient = useQueryClient();

  const { mutate: createBallEvent, isPending } = useMutation({
    mutationFn: createBallEventAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["eventsByMatchId"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { createBallEvent, isPending };
}
