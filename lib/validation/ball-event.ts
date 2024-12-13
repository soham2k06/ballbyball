import { z } from "zod";

export const createBallEventSchema = z.object({
  matchId: z.string().min(1),
  batsmanId: z.string().min(1),
  bowlerId: z.string().min(1),
  type: z.string().min(1),
});

export type CreateBallEventSchema = z.infer<typeof createBallEventSchema>;
