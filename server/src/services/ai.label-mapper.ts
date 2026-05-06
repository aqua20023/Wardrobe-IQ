/**
 * Maps raw FastAPI inference labels to the wardrobe schema category enum.
 *
 * FastAPI returns fine-grained clothing labels (e.g. "shirt", "jeans").
 * The wardrobe schema uses broader lifestyle categories (e.g. "tops", "bottoms").
 *
 * This module is the single place to update when:
 *  - New AI labels are added to the FastAPI classifier
 *  - New wardrobe categories are introduced to the schema
 */

import { wardrobeCategories } from "../modules/wardrobe/clothingItem.model";

/** All valid wardrobe category strings, derived from the schema enum. */
export type WardrobeCategory = (typeof wardrobeCategories)[number];

/** Raw label strings the FastAPI classifier can return. */
type AiLabel =
  | "shirt"
  | "t-shirt"
  | "jeans"
  | "trousers"
  | "dress"
  | "jacket"
  | "shoes"
  | "unknown";

const AI_LABEL_TO_CATEGORY: Record<AiLabel, WardrobeCategory> = {
  shirt: "tops",
  "t-shirt": "tops",
  jeans: "bottoms",
  trousers: "bottoms",
  dress: "dresses",
  jacket: "outerwear",
  shoes: "shoes",
  unknown: "other",
};

/**
 * Converts a raw FastAPI prediction label to the nearest wardrobe category.
 *
 * Falls back to "other" for any unrecognised label so the system is
 * forward-compatible when the AI model is retrained with new classes.
 *
 * @param aiLabel - The `category` string returned by POST /predict/category
 * @returns A valid WardrobeCategory
 */
export function mapAiLabelToCategory(aiLabel: string): WardrobeCategory {
  const mapped = AI_LABEL_TO_CATEGORY[aiLabel as AiLabel];
  if (!mapped) {
    console.warn(`[AI Label Mapper] Unknown AI label "${aiLabel}" — falling back to "other".`);
    return "other";
  }
  return mapped;
}
