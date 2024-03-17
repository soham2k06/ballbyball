import { deleteAllBallEvents as deleteAllBallEventsAPI } from "@/services/ballEvent/deleteAllBallEvents";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteAllBallEvents() {
  const queryClient = useQueryClient();

  const { mutate: deleteAllBallEvents, isPending } = useMutation({
    mutationFn: deleteAllBallEventsAPI,
    onSuccess: () => {
      toast.success("Match Restarted! All ball events undone.");
      queryClient.invalidateQueries({ queryKey: ["eventsByMatchId"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { deleteAllBallEvents, isPending };
}
