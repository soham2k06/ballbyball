import axios from "axios";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import {
  CreateMatchSchema,
  UpdateMatchSchema,
} from "@/lib/validation/match";
import { MatchExtended } from "@/types";

export interface MatchesParams {
  page?: string | null;
  pageSize?: string | null;
  sort?: string | null;
  search?: string | null;
  userRef?: string | null;
}

function buildMatchesUrl(params: MatchesParams) {
  const sp = new URLSearchParams();
  if (params.page) sp.set("page", params.page);
  if (params.pageSize) sp.set("pageSize", params.pageSize);
  if (params.sort) sp.set("sort", params.sort);
  if (params.search) sp.set("search", params.search);
  if (params.userRef) sp.set("user", params.userRef);
  const q = sp.toString();
  return `/api/matches${q ? `?${q}` : ""}`;
}

export function getMatchesQueryOptions(params: MatchesParams = {}) {
  return {
    queryKey: queryKeys.matches.all(params),
    queryFn: async () => {
      const { data } = await axios.get<{
        matches: MatchExtended[];
        count: number;
      }>(buildMatchesUrl(params));
      return data;
    },
  };
}

export function useMatches(params: MatchesParams = {}) {
  const { data, isFetching, isFetched } = useQuery({
    ...getMatchesQueryOptions(params),
    placeholderData: keepPreviousData,
  });
  return {
    matches: data?.matches ?? [],
    matchesCount: data?.count ?? 0,
    isLoading: isFetching,
    isFetched,
  };
}

export function getMatchDetailQueryOptions(
  id: string,
  userRef?: string | null,
) {
  const params = userRef ? `?user=${userRef}` : "";
  return {
    queryKey: queryKeys.matches.detail(id),
    queryFn: async () => {
      const { data } = await axios.get<MatchExtended>(
        `/api/matches/${id}${params}`,
      );
      return data;
    },
  };
}

export function useMatch(id: string, userRef?: string | null) {
  const { data: match, isLoading, isFetched } = useQuery({
    ...getMatchDetailQueryOptions(id, userRef),
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
