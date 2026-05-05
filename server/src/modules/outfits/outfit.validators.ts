import { z } from "zod";
import { occasions } from "../wardrobe/clothingItem.model";

export const createOutfitSchema = z.object({
  title: z.string().min(2).max(120),
  itemIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).min(1),
  occasion: z.enum(occasions).default("casual"),
  notes: z.string().max(500).optional(),
  saved: z.boolean().default(false)
});

export const updateOutfitSchema = createOutfitSchema.partial();

export const outfitQuerySchema = z.object({
  saved: z.coerce.boolean().optional(),
  liked: z.coerce.boolean().optional(),
  occasion: z.enum(occasions).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20)
});

export type OutfitQuery = z.infer<typeof outfitQuerySchema>;

export const idParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid id")
});
