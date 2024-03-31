import { z } from "zod";

export const createTeamSchema = z.object({
  name: z.string().min(1),
  playerIds: z.array(z.string()).refine((value) => value.some((item) => item)),
  captain: z.string().nullable(),
});

export const updateTeamSchema = createTeamSchema.extend({
  id: z.string().min(1),
});

export type CreateTeamSchema = z.infer<typeof createTeamSchema>;
export type UpdateTeamSchema = z.infer<typeof updateTeamSchema>;
