import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { udpateMatch as udpateMatchAPI } from "@/services/match/updateMatch";

export function useUpdateMatch() {
  const queryClient = useQueryClient();

  const { mutate: udpateMatch, isPending } = useMutation({
    mutationFn: udpateMatchAPI,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["matchById"] }),
    onError: (err) => toast.error(err.message),
  });

  return { udpateMatch, isPending };
}
