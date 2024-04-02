import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateMatch as updateMatchAPI } from "@/services/match";

export function useUpdateMatch() {
  const queryClient = useQueryClient();

  const { mutate: updateMatch, isPending } = useMutation({
    mutationFn: updateMatchAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matchById"] });
      queryClient.invalidateQueries({ queryKey: ["allMatches"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { updateMatch, isPending };
}
