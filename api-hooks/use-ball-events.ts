import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { CreateBallEventSchema } from "@/lib/validation/ball-event";

export function useSaveBallEvents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (events: CreateBallEventSchema[]) => {
      const { data } = await axios.post("/api/ball-events", events);
      return data;
    },
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
    mutationFn: async (matchId: string) => {
      const { data } = await axios.delete(`/api/ball-events/${matchId}`);
      return data;
    },
    onSuccess: (_data, matchId) => {
      qc.invalidateQueries({ queryKey: queryKeys.matches.detail(matchId) });
    },
  });
}
