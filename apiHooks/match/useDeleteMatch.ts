import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteMatch as deleteMatchAPI } from "@/services/match";

export function useDeleteMatch() {
  const queryClient = useQueryClient();

  const { mutate: deleteMatch, isPending } = useMutation({
    mutationFn: deleteMatchAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allMatches"] });
      toast.success("Match deleted successfully");
    },
    onError: () => toast.error("Error deleting a match"),
  });

  return { deleteMatch, isPending };
}
