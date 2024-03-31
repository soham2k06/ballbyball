import { z } from "zod";

export const TeamSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string(),
  players: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
  match: z.object({ id: z.string() }).nullable(),
  matchId: z.string().nullable(),
});

export const createTeamSchema = z.object({
  name: z.string().min(1),
  playerIds: z.array(z.string()).refine((value) => value.some((item) => item)),
  captain: z.string().optional(),
});

export type CreateTeamSchema = z.infer<typeof createTeamSchema>;

export const updateTeamSchema = createTeamSchema.extend({
  id: z.string().min(1),
});

export const deleteTeamSchema = z.object({
  id: z.string().min(1),
});
