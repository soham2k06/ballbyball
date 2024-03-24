import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createTeam as createTeamAPI } from "@/services/team";

export function useCreateTeam() {
  const queryClient = useQueryClient();

  const { mutate: createTeam, isPending } = useMutation({
    mutationFn: createTeamAPI,
    onSuccess: () => {
      toast.success("Team successfully created");
      queryClient.invalidateQueries({ queryKey: ["allTeams"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { createTeam, isPending };
}
