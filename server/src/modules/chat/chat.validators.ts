import { z } from "zod";

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(500),
  context: z
    .object({
      occasion: z.string().optional(),
      weather: z.string().optional()
    })
    .optional()
});
