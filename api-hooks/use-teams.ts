import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

import { queryKeys } from "@/lib/query-keys";
import { CreateTeamSchema, UpdateTeamSchema } from "@/lib/validation/team";
import { TeamWithPlayers } from "@/types";

export function useTeams(userRef?: string | null) {
  const params = userRef ? `?user=${userRef}` : "";
  const queryKey = userRef
    ? [...queryKeys.teams.all, userRef]
    : queryKeys.teams.all;
  const {
    data: teams = [],
    isFetching,
    isFetched,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await axios.get<TeamWithPlayers[]>(
        `/api/teams${params}`,
      );
      return data;
    },
  });
  return { teams, isLoading: isFetching, isFetching, isFetched };
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateTeamSchema) => {
      const { data } = await axios.post("/api/teams", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teams.all }),
  });
}

export function useCreateMultipleTeams() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (teams: CreateTeamSchema[]) => {
      const { data } = await axios.post("/api/teams/multiple", { teams });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teams.all }),
  });
}

export function useUpdateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateTeamSchema) => {
      const { data } = await axios.patch(`/api/teams/${id}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teams.all }),
  });
}

export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`/api/teams/${id}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teams.all }),
  });
}
