import { z } from "zod";

const curPlayer = z.object({
  id: z.string(),
  type: z.string(),
});

export const createMatchSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  desc: z.string().optional(),
  teamIds: z.array(z.string()).min(2, { message: "Select exact two teams" }),
  overs: z.number().min(1).max(50),
  curPlayers: z.array(curPlayer).optional(),
  curTeam: z.number().min(0).max(1).optional(),
  date: z.date().optional(),
  time: z.date().optional(),
});

export type CreateMatchSchema = z.infer<typeof createMatchSchema>;

export const updateMatchSchema = z.object({
  id: z.string().min(1),
  // name: z.string().min(1, { message: "Name is required" }),
  // desc: z.string().optional(),
  // teamIds: z.array(z.string()).min(2, { message: "Select exact two teams" }),
  // overs: z.number().min(1).max(50).optional(),
  curPlayers: z.array(curPlayer.nullable()),
  // curTeam: z.number().min(0).max(1),
  // date: z.date().optional(),
  // time: z.date().optional(),
});

export type UpdateMatchSchema = z.infer<typeof updateMatchSchema>;

export const deleteMatchSchema = z.object({
  id: z.string().min(1),
});
