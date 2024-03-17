import { undoBallEvent as undoBallEventAPI } from "@/services/ballEvent/undoBallEvent";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUndoBallEvent() {
  const queryClient = useQueryClient();

  const { mutate: undoBallEvent, isPending } = useMutation({
    mutationFn: undoBallEventAPI,
    onSuccess: () => {
      toast.success("Ball event undone");
      queryClient.invalidateQueries({ queryKey: ["eventsByMatchId"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { undoBallEvent, isPending };
}
