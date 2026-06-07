import axios from "axios";
import { Player } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import {
  CreatePlayerSchema,
  UpdatePlayerSchema,
} from "@/lib/validation/player";

type PlayerSimple = Pick<Player, "id" | "name" | "order">;

export function usePlayers(userRef?: string | null) {
  const params = userRef ? `?user=${userRef}` : "";
  const queryKey = userRef
    ? [...queryKeys.players.all, userRef]
    : queryKeys.players.all;
  const { data: players = [], isFetching, isFetched } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await axios.get<PlayerSimple[]>(`/api/players${params}`);
      return data;
    },
  });
  return { players, isLoading: isFetching, isFetched };
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
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.players.all }),
  });
}

export function useCreateMultiplePlayers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (names: string[]) => {
      const { data } = await axios.post("/api/players/multiple", { names });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.players.all }),
  });
}

export function useUpdatePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: UpdatePlayerSchema) => {
      const { data } = await axios.patch(`/api/players/${id}`, payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.players.all }),
  });
}

export function useDeletePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`/api/players/${id}`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.players.all }),
  });
}

export function useSortPlayers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ players }: { players: Player[] }) => {
      const { data } = await axios.patch("/api/players/sort", { players });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.players.all }),
  });
}
