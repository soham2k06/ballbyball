import axios from "axios";
import { Player } from "@prisma/client";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import {
  CreatePlayerSchema,
  UpdatePlayerSchema,
} from "@/lib/validation/player";

type PlayerSimple = Pick<Player, "id" | "name" | "order">;

export interface PlayersParams {
  page?: string | null;
  pageSize?: string | null;
  search?: string | null;
  userRef?: string | null;
}

function buildPlayersUrl(params: PlayersParams) {
  const sp = new URLSearchParams();
  if (params.page) sp.set("page", params.page);
  if (params.pageSize) sp.set("pageSize", params.pageSize);
  if (params.search) sp.set("search", params.search);
  if (params.userRef) sp.set("user", params.userRef);
  const q = sp.toString();
  return `/api/players${q ? `?${q}` : ""}`;
}

export function getPlayersQueryOptions(params: PlayersParams = {}) {
  return {
    queryKey: queryKeys.players.all(params),
    queryFn: async () => {
      const { data } = await axios.get<{ players: PlayerSimple[]; count: number }>(
        buildPlayersUrl(params),
      );
      return data;
    },
  };
}

export function usePlayers(params: PlayersParams = {}) {
  const { data, isFetching, isFetched } = useQuery({
    ...getPlayersQueryOptions(params),
    placeholderData: keepPreviousData,
  });
  return {
    players: data?.players ?? [],
    playersCount: data?.count ?? 0,
    isLoading: isFetching,
    isFetched,
  };
}

export function useSortedPlayersByPerformance(options?: { enabled?: boolean }) {
  const { data: sortedPlayers = [], isFetched, refetch, isFetching } = useQuery(
    {
      ...options,
      queryKey: queryKeys.players.performance,
      queryFn: async () => {
        const { data } = await axios.get<
          { id: string; name: string; points: number }[]
        >("/api/players/records");
        return data;
      },
    },
  );
  return {
    sortedPlayers,
    isLoading: isFetching,
    isSorted: isFetched,
    sort: refetch,
  };
}

export function useCreatePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreatePlayerSchema) => {
      const { data } = await axios.post<{ id: string; name: string }>(
        "/api/players",
        payload,
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.players.all() }),
  });
}

export function useCreateMultiplePlayers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (names: string[]) => {
      const { data } = await axios.post("/api/players/multiple", { names });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.players.all() }),
  });
}

export function useUpdatePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdatePlayerSchema) => {
      const { data } = await axios.patch(`/api/players/${id}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.players.all() }),
  });
}

export function useDeletePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`/api/players/${id}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.players.all() }),
  });
}

export function useSortPlayers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ players }: { players: Player[] }) => {
      const { data } = await axios.patch("/api/players/sort", { players });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.players.all() }),
  });
}
