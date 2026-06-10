import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import {
  CreateMatchSchema,
  UpdateMatchSchema,
} from "@/lib/validation/match";
import { MatchExtended } from "@/types";

export function useMatches(size?: string) {
  const params = size ? `?size=${size}` : "";
  const { data: matches = [], isFetching, isFetched } = useQuery({
    queryKey: queryKeys.matches.all(),
    queryFn: () => apiFetch<MatchExtended[]>(`/api/matches${params}`),
  });
  return { matches, isLoading: isFetching, isFetched };
}

export function useCreateMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMatchSchema) =>
      apiFetch<{ id: string }>("/api/matches", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.matches.all() }),
  });
}

export function useUpdateMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdateMatchSchema) =>
      apiFetch(`/api/matches/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.matches.all() });
      qc.invalidateQueries({ queryKey: queryKeys.matches.detail(vars.id) });
    },
  });
}

export function useDeleteMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/matches/${id}`, { method: "DELETE" }),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.matches.all() }),
  });
}
