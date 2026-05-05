import { ClothingItemModel } from "../wardrobe/clothingItem.model";
import { OutfitModel } from "../outfits/outfit.model";
import type { recommendationQuerySchema } from "./recommendation.validators";
import type { z } from "zod";

type RecommendationQuery = z.infer<typeof recommendationQuerySchema>;

const categoryOrder = ["tops", "bottoms", "outerwear", "shoes", "accessories", "dresses"];

export const recommendationService = {
  async getSuggestedOutfits(userId: string, query: RecommendationQuery) {
    const filter: Record<string, unknown> = { userId };
    if (query.occasion) filter.occasion = query.occasion;
    if (query.category) filter.category = query.category;

    const [items, savedOutfits] = await Promise.all([
      ClothingItemModel.find(filter).sort({ usageCount: 1, createdAt: -1 }).limit(30).lean(),
      OutfitModel.find({ userId, saved: true }).sort({ createdAt: -1 }).limit(3).populate("itemIds").lean()
    ]);

    const byCategory = new Map<string, typeof items>();
    for (const item of items) {
      byCategory.set(item.category, [...(byCategory.get(item.category) ?? []), item]);
    }

    const generated = Array.from({ length: Math.max(query.limit - savedOutfits.length, 0) }).map((_, index) => {
      const selected = categoryOrder
        .map((category) => byCategory.get(category)?.[index % Math.max(byCategory.get(category)?.length ?? 1, 1)])
        .filter(Boolean);

      return {
        id: `mock-${index + 1}`,
        title: query.occasion ? `${query.occasion} capsule ${index + 1}` : `Wardrobe mix ${index + 1}`,
        occasion: query.occasion ?? "casual",
        weather: query.weather ?? "any",
        items: selected,
        saved: false,
        liked: false,
        confidence: 0.72,
        reason: "Rule-based placeholder using under-worn items and occasion tags. AI ranking can replace this later."
      };
    });

    const saved = savedOutfits.map((outfit) => ({
      id: outfit._id.toString(),
      title: outfit.title,
      occasion: outfit.occasion,
      weather: query.weather ?? "any",
      items: outfit.itemIds,
      saved: outfit.saved,
      liked: outfit.liked,
      confidence: 0.81,
      reason: "Saved outfit surfaced as a reliable fallback while recommendation intelligence is pending."
    }));

    return [...saved, ...generated].slice(0, query.limit);
  }
};
