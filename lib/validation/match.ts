import { z } from "zod";

const curPlayer = z.object({
  id: z.string(),
  type: z.enum(["batsman", "bowler"]),
});

export const createMatchSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(1, { message: "Name is required" }),
  teamIds: z
    .array(z.string())
    .min(2, { message: "Select only 2 teams" })
    .max(2, { message: "Select only 2 teams" }),
  overs: z
    .number({
      required_error: "Overs is required",
      invalid_type_error: "Invalid Number",
    })
    .min(1, "Overs must be greater than 0")
    .max(50),
  batFirst: z.string(),
  curPlayers: z.array(curPlayer).optional(),
  allowSinglePlayer: z.boolean().optional(),
});

export type CreateMatchSchema = z.infer<typeof createMatchSchema>;

export const updateMatchSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, { message: "Name is required" }).optional(),
  overs: z.number().min(1).max(50).optional(),
  curPlayers: z.array(curPlayer.nullable()).optional(),
  teamIds: z.array(z.string()).optional(),
  batFirst: z.string().optional(),
  strikeIndex: z.number().optional(),
  hasEnded: z.boolean().optional(),
  allowSinglePlayer: z.boolean().optional(),
});

export type UpdateMatchSchema = z.infer<typeof updateMatchSchema>;
