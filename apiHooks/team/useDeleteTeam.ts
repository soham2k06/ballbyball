import { deleteTeam as deleteTeamAPI } from "@/services/team";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useDeleteTeam() {
  const queryClient = useQueryClient();

  const { mutate: deleteTeam, isPending } = useMutation({
    mutationFn: deleteTeamAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allTeams"],
      });
      toast.success("Team deleted successfully");
    },
    onError: () => toast.error("Error deleting a team"),
  });

  return { deleteTeam, isPending };
}
