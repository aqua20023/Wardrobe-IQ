import type { FilterQuery } from "mongoose";
import { cacheDeleteByPrefix, cacheGet, cacheSet } from "../../config/redis";
import { AppError } from "../../common/utils/AppError";
import { ClothingItemModel } from "../wardrobe/clothingItem.model";
import { OutfitModel, type Outfit } from "./outfit.model";
import { outfitRepository } from "./outfit.repository";
import type { createOutfitSchema, outfitQuerySchema, updateOutfitSchema } from "./outfit.validators";
import type { z } from "zod";

type CreateInput = z.infer<typeof createOutfitSchema>;
type UpdateInput = z.infer<typeof updateOutfitSchema>;
type QueryInput = z.infer<typeof outfitQuerySchema>;

async function assertUserOwnsItems(userId: string, itemIds: string[]) {
  const count = await ClothingItemModel.countDocuments({ _id: { $in: itemIds }, userId });
  if (count !== itemIds.length) {
    throw new AppError("One or more clothing items were not found", 400);
  }
}

export const outfitService = {
  async create(userId: string, input: CreateInput) {
    await assertUserOwnsItems(userId, input.itemIds);
    const outfit = await outfitRepository.create({ ...input, userId });
    await cacheDeleteByPrefix(`outfits:${userId}`);
    return outfit.populate("itemIds");
  },

  async list(userId: string, query: QueryInput) {
    const cacheKey = `outfits:${userId}:${JSON.stringify(query)}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const filter: FilterQuery<Outfit> = { userId };
    if (query.saved !== undefined) filter.saved = query.saved;
    if (query.liked !== undefined) filter.liked = query.liked;
    if (query.occasion) filter.occasion = query.occasion;

    const result = await outfitRepository.findForUser(filter, { page: query.page, limit: query.limit });
    await cacheSet(cacheKey, result, 90);
    return result;
  },

  async get(userId: string, id: string) {
    const outfit = await outfitRepository.findByIdForUser(id, userId);
    if (!outfit) throw new AppError("Outfit not found", 404);
    return outfit;
  },

  async update(userId: string, id: string, input: UpdateInput) {
    if (input.itemIds) await assertUserOwnsItems(userId, input.itemIds);

    const outfit = await outfitRepository.updateByIdForUser(id, userId, input);
    if (!outfit) throw new AppError("Outfit not found", 404);

    await cacheDeleteByPrefix(`outfits:${userId}`);
    return outfit;
  },

  async remove(userId: string, id: string) {
    const outfit = await outfitRepository.deleteByIdForUser(id, userId);
    if (!outfit) throw new AppError("Outfit not found", 404);
    await cacheDeleteByPrefix(`outfits:${userId}`);
    return outfit;
  },

  async saved(userId: string) {
    return OutfitModel.find({ userId, saved: true }).sort({ createdAt: -1 }).populate("itemIds");
  }
};
