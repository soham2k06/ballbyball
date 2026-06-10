import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";

import { queryKeys } from "@/lib/query-keys";
import { CreateTeamSchema, UpdateTeamSchema } from "@/lib/validation/team";
import { TeamWithPlayers } from "@/types";

export interface TeamsParams {
  page?: string | null;
  pageSize?: string | null;
  sort?: string | null;
  search?: string | null;
  userRef?: string | null;
}

function buildTeamsUrl(params: TeamsParams) {
  const sp = new URLSearchParams();
  if (params.page) sp.set("page", params.page);
  if (params.pageSize) sp.set("pageSize", params.pageSize);
  if (params.sort) sp.set("sort", params.sort);
  if (params.search) sp.set("search", params.search);
  if (params.userRef) sp.set("user", params.userRef);
  const q = sp.toString();
  return `/api/teams${q ? `?${q}` : ""}`;
}

export function getTeamsQueryOptions(params: TeamsParams = {}) {
  return {
    queryKey: queryKeys.teams.all(params),
    queryFn: async () => {
      const { data } = await axios.get<{ teams: TeamWithPlayers[]; count: number }>(
        buildTeamsUrl(params),
      );
      return data;
    },
  };
}

export function useTeams(params: TeamsParams = {}) {
  const {
    data,
    isFetching,
    isFetched,
  } = useQuery({
    ...getTeamsQueryOptions(params),
    placeholderData: keepPreviousData,
  });
  return {
    teams: data?.teams ?? [],
    teamsCount: data?.count ?? 0,
    isLoading: isFetching,
    isFetching,
    isFetched,
  };
}

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateTeamSchema) => {
      const { data } = await axios.post("/api/teams", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teams.all() }),
  });
}

export function useCreateMultipleTeams() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (teams: CreateTeamSchema[]) => {
      const { data } = await axios.post("/api/teams/multiple", { teams });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teams.all() }),
  });
}

export function useUpdateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdateTeamSchema) => {
      const { data } = await axios.patch(`/api/teams/${id}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teams.all() }),
  });
}

export function useDeleteTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`/api/teams/${id}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teams.all() }),
  });
}
