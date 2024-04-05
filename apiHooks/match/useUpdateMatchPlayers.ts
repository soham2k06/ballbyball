import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateMatchPlayers as updateMatchPlayersAPI } from "@/services/match";

export function useUpdateMatchPlayers() {
  const queryClient = useQueryClient();

  const { mutate: updateMatchPlayers, isPending } = useMutation({
    mutationFn: updateMatchPlayersAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matchById"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { updateMatchPlayers, isPending };
}
