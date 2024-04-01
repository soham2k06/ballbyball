import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deletePlayer as deletePlayerAPI } from "@/services/player";

export function useDeletePlayer() {
  const queryClient = useQueryClient();

  const { mutate: deletePlayer, isPending } = useMutation({
    mutationFn: deletePlayerAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allPlayers"],
      });
      toast.success("Player deleted successfully");
    },
    onError: () => toast.error("Error deleting a player"),
  });

  return { deletePlayer, isPending };
}
