import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateTeam as updateTeamAPI } from "@/services/team";

export function useUpdateTeam() {
  const queryClient = useQueryClient();

  const { mutate: updateTeam, isPending } = useMutation({
    mutationFn: updateTeamAPI,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["allTeams", "teamById"],
      });
      toast.success("Team updated successfully");
    },
    onError: (err) => toast.error(err.message),
  });

  return { updateTeam, isPending };
}
