import { udpateMatch as udpateMatchAPI } from "@/services/match/updateMatch";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateMatch() {
  const queryClient = useQueryClient();

  const { mutate: udpateMatch, isPending } = useMutation({
    mutationFn: udpateMatchAPI,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["allMatches"] }),
    onError: (err) => toast.error(err.message),
  });

  return { udpateMatch, isPending };
}
