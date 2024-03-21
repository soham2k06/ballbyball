import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createMultiplePlayers as createMultiplePlayersAPI } from "@/services/player/createMultiplePlayers";

export function useCreateMultiplePlayers() {
  const queryClient = useQueryClient();

  const { mutate: createMultiplePlayers, isPending } = useMutation({
    mutationFn: createMultiplePlayersAPI,
    onSuccess: () => {
      toast.success("Players successfully created");
      queryClient.invalidateQueries({ queryKey: ["allPlayers"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { createMultiplePlayers, isPending };
}
