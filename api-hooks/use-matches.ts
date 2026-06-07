import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import {
  CreateMatchSchema,
  UpdateMatchSchema,
} from "@/lib/validation/match";
import { MatchExtended } from "@/types";

export function useMatches(size?: string | null, userRef?: string | null) {
  const sp = new URLSearchParams();
  if (size) sp.set("size", size);
  if (userRef) sp.set("user", userRef);
  const params = sp.toString() ? `?${sp.toString()}` : "";

  const queryKey = userRef
    ? [...queryKeys.matches.all(size ?? undefined), userRef]
    : queryKeys.matches.all(size ?? undefined);

  const { data, isFetching, isFetched } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await axios.get<{
        matches: MatchExtended[];
        count: number;
      }>(`/api/matches${params}`);
      return data;
    },
  });
  return {
    matches: data?.matches ?? [],
    matchesCount: data?.count ?? 0,
    isLoading: isFetching,
    isFetched,
  };
}

export function useMatch(id: string, userRef?: string | null) {
  const params = userRef ? `?user=${userRef}` : "";
  const { data: match, isLoading, isFetched } = useQuery({
    queryKey: queryKeys.matches.detail(id),
    queryFn: async () => {
      const { data } = await axios.get<MatchExtended>(
        `/api/matches/${id}${params}`,
      );
      return data;
    },
    enabled: !!id,
  });
  return { match, isLoading, isFetched };
}

export function useCreateMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateMatchSchema) => {
      const { data } = await axios.post<{ id: string }>("/api/matches", payload);
      return data;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.matches.all() }),
  });
}

export function useUpdateMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateMatchSchema) => {
      const { data } = await axios.patch(`/api/matches/${id}`, payload);
      return data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.matches.all() });
      qc.invalidateQueries({ queryKey: queryKeys.matches.detail(vars.id) });
    },
  });
}

export function useDeleteMatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`/api/matches/${id}`);
      return data;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: queryKeys.matches.all() }),
  });
}
