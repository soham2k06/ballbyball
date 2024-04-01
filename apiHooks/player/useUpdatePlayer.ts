import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updatePlayer as updatePlayerAPI } from "@/services/player";

export function useUpdatePlayer() {
  const queryClient = useQueryClient();

  const { mutate: udpatePlayer, isPending } = useMutation({
    mutationFn: updatePlayerAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allPlayers"],
      });
      toast.success("Player updated successfully");
    },
    onError: (err) => toast.error(err.message),
  });

  return { udpatePlayer, isPending };
}
