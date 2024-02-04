import { z } from "zod";

export const createPlayerSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  image: z.string().optional(),
  desc: z.string().optional(),
  isCaptain: z.boolean().optional(),
  curMatchBatEvents: z.array(z.string()).optional(),
  curMatchBallEvents: z.array(z.string()).optional(),
  overallBatEvents: z.array(z.string()).optional(),
  overallBallEvents: z.array(z.string()).optional(),
});

export type CreatePlayerSchema = z.infer<typeof createPlayerSchema>;

export const updatePlayerSchema = createPlayerSchema.extend({
  id: z.string().min(1),
});

export const deletePlayerSchema = z.object({
  id: z.string().min(1),
});
