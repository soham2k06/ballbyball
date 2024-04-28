import { z } from "zod";

export const createPlayerSchema = z.object({
  name: z.string().trim().min(1, { message: "Name is required" }),
  image: z.string().optional(),
});

export const updatePlayerSchema = createPlayerSchema.extend({
  id: z.string(),
});

export type CreatePlayerSchema = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerSchema = z.infer<typeof updatePlayerSchema>;
