import { Player } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import {
  CreatePlayerSchema,
  UpdatePlayerSchema,
} from "@/lib/validation/player";

type PlayerSimple = Pick<Player, "id" | "name" | "order">;

export function usePlayers() {
  const {
    data: players = [],
    isFetching,
    isFetched,
  } = useQuery({
    queryKey: queryKeys.players.all(),
    queryFn: () => apiFetch<PlayerSimple[]>("/api/players"),
  });
  return { players, isLoading: isFetching, isFetched };
}

export function useCreatePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlayerSchema) =>
      apiFetch<{ id: string; name: string }>("/api/players", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.players.all() }),
  });
}

export function useCreateMultiplePlayers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (names: string[]) =>
      apiFetch("/api/players/multiple", {
        method: "POST",
        body: JSON.stringify({ names }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.players.all() }),
  });
}

export function useUpdatePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: UpdatePlayerSchema) =>
      apiFetch(`/api/players/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.players.all() }),
  });
}

export function useDeletePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/players/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.players.all() }),
  });
}

export function useSortPlayers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ players }: { players: Player[] }) =>
      apiFetch("/api/players/sort", {
        method: "PATCH",
        body: JSON.stringify({ players }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.players.all() }),
  });
}
