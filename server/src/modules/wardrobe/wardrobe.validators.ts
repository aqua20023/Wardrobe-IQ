import { z } from "zod";
import { occasions, seasons, wardrobeCategories } from "./clothingItem.model";

const csvToArray = (value: unknown) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return value.split(",").map((item) => item.trim()).filter(Boolean);
  return value;
};

export const createClothingItemSchema = z.object({
  imageUrl: z.string().url().optional(),
  category: z.enum(wardrobeCategories),
  subcategory: z.string().max(80).optional(),
  color: z.string().max(40).optional(),
  tags: z.preprocess(csvToArray, z.array(z.string()).default([])),
  occasion: z.preprocess(csvToArray, z.array(z.enum(occasions)).default(["casual"])),
  season: z.preprocess(csvToArray, z.array(z.enum(seasons)).default(["all-season"])),
  notes: z.string().max(500).optional(),
  // AI hint fields — sent back by the client when the user reviewed an AI suggestion.
  // If predictedCategory differs from category the server marks userCorrected = true.
  predictedCategory: z.enum(wardrobeCategories).optional(),
  confidence: z.number().min(0).max(1).optional()
});

export const updateClothingItemSchema = createClothingItemSchema.partial();

export const wardrobeQuerySchema = z.object({
  category: z.enum(wardrobeCategories).optional(),
  color: z.string().optional(),
  occasion: z.enum(occasions).optional(),
  season: z.enum(seasons).optional(),
  search: z.string().optional(),
  sort: z.enum(["newest", "oldest", "most-used", "least-used"]).default("newest"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(20)
});

export type WardrobeQuery = z.infer<typeof wardrobeQuerySchema>;

export const idParamSchema = z.object({
  id: z.string().regex(/^[a-f\d]{24}$/i, "Invalid id")
});
