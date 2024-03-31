import { z } from "zod";

export const createPlayerSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});

export type CreatePlayerSchema = z.infer<typeof createPlayerSchema>;
