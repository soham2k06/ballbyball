import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import {
  CreateTeamSchema,
  UpdateTeamSchema,
} from "@/lib/validation/team";
import { TeamWithPlayers } from "@/types";

export function useTeams() {
  const { data: teams = [], isFetching, isFetched } = useQuery({
    queryKey: queryKeys.teams.all,
    queryFn: () => apiFetch<TeamWithPlayers[]>("/api/teams"),
  });
  return { teams, isLoading: isFetching, isFetched };
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTeamSchema) =>
      apiFetch("/api/teams", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teams.all }),
  });
}

export function useCreateMultipleTeams() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (teams: CreateTeamSchema[]) =>
      apiFetch("/api/teams/multiple", {
        method: "POST",
        body: JSON.stringify({ teams }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teams.all }),
  });
}

export function useUpdateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateTeamSchema) =>
      apiFetch(`/api/teams/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teams.all }),
  });
}

export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/teams/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teams.all }),
  });
}
