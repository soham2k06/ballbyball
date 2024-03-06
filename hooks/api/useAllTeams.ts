"use client";

import { useQuery } from "@tanstack/react-query";
import { getAllTeams } from "@/services/teams/getAllTeams";

export function useAllTeams() {
  const {
    data: allTeams,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["allTeams"],
    queryFn: getAllTeams,
  });

  return { allTeams, isLoading, isFetching, refetch };
}

// export function useCreateRole() {
//   const queryClient = useQueryClient();

//   const { mutate: createRole, isPending } = useMutation({
//     mutationFn: createRoleApi,
//     onSuccess: (data: RolePropForm) => {
//       toast.success(`${data.name} is successfully created`);
//       queryClient.invalidateQueries({ queryKey: ["allTeams"] });
//     },
//     onError: (err) => toast.error(err.message),
//   });

//   return { createRole, isPending };
// }
