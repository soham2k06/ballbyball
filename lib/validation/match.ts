import { z } from "zod";

export const createMatchSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  desc: z.string().optional(),
  teamIds: z.array(z.string()).nullable(),
  date: z.date().optional(),
  time: z.date().optional(),
});

export type CreateMatchSchema = z.infer<typeof createMatchSchema>;

export const updateMatchSchema = createMatchSchema.extend({
  id: z.string().min(1),
});

export const deleteMatchSchema = z.object({
  id: z.string().min(1),
});
