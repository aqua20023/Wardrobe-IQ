import { z } from "zod";
import { occasions, wardrobeCategories } from "../wardrobe/clothingItem.model";

export const recommendationQuerySchema = z.object({
  weather: z.string().optional(),
  occasion: z.enum(occasions).optional(),
  category: z.enum(wardrobeCategories).optional(),
  limit: z.coerce.number().int().positive().max(10).default(5)
});

export type RecommendationQuery = z.infer<typeof recommendationQuerySchema>;
