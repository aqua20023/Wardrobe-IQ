import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  avatar: z.string().url().optional(),
  styleProfile: z
    .object({
      styleKeywords: z.array(z.string()).default([]).optional(),
      avoidKeywords: z.array(z.string()).default([]).optional(),
      favoriteBrands: z.array(z.string()).default([]).optional()
    })
    .optional()
});

export const updatePreferencesSchema = z.object({
  preferredColors: z.array(z.string()).default([]).optional(),
  preferredOccasions: z.array(z.string()).default([]).optional(),
  sizeProfile: z
    .object({
      top: z.string().optional(),
      bottom: z.string().optional(),
      shoe: z.string().optional()
    })
    .optional(),
  climate: z.string().optional(),
  notificationsEnabled: z.boolean().optional()
});
