import { useMutation, useQueryClient } from "@tanstack/react-query";

import { apiFetch } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { CreateBallEventSchema } from "@/lib/validation/ball-event";

export function useSaveBallEvents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBallEventSchema[]) =>
      apiFetch("/api/ball-events", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, vars) => {
      const matchId = vars[0]?.matchId;
      if (matchId)
        qc.invalidateQueries({ queryKey: queryKeys.matches.detail(matchId) });
    },
  });
}

export function useDeleteAllBallEvents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (matchId: string) =>
      apiFetch(`/api/ball-events/${matchId}`, { method: "DELETE" }),
    onSuccess: (_data, matchId) => {
      qc.invalidateQueries({ queryKey: queryKeys.matches.detail(matchId) });
    },
  });
}
