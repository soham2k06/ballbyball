import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updatePlayer as updatePlayerAPI } from "@/services/player";

export function useUpdatePlayer() {
  const queryClient = useQueryClient();

  const { mutate: udpateMatch, isPending } = useMutation({
    mutationFn: updatePlayerAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allPlayers", "playerById"],
      });
      toast.success("Player updated successfully");
    },
    onError: (err) => toast.error(err.message),
  });

  return { udpateMatch, isPending };
}
