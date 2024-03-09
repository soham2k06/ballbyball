import { createPlayer as createPlayerAPI } from "@/services/player/createPlayer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useCreatePlayer() {
  const queryClient = useQueryClient();

  const { mutate: createPlayer, isPending } = useMutation({
    mutationFn: createPlayerAPI,
    onSuccess: () => {
      toast.success(`Player successfully created`);
      queryClient.invalidateQueries({ queryKey: ["allPlayers"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { createPlayer, isPending };
}
