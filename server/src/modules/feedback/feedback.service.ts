import { cacheDeleteByPrefix } from "../../config/redis";
import { AppError } from "../../common/utils/AppError";
import { ClothingItemModel } from "../wardrobe/clothingItem.model";
import { OutfitModel } from "../outfits/outfit.model";
import { feedbackRepository } from "./feedback.repository";
import type { createFeedbackSchema } from "./feedback.validators";
import type { z } from "zod";

type CreateInput = z.infer<typeof createFeedbackSchema>;

export const feedbackService = {
  async create(userId: string, input: CreateInput) {
    const outfit = await OutfitModel.findOne({ _id: input.outfitId, userId });
    if (!outfit) throw new AppError("Outfit not found", 404);

    const feedback = await feedbackRepository.create({ userId, outfitId: input.outfitId, action: input.action });

    if (input.action === "like") outfit.liked = true;
    if (input.action === "dislike") outfit.liked = false;
    if (input.action === "save") outfit.saved = true;
    if (input.action === "worn") {
      outfit.set("wornCount", Number(outfit.wornCount ?? 0) + 1);
      await ClothingItemModel.updateMany(
        { _id: { $in: outfit.itemIds as unknown[] }, userId },
        { $inc: { usageCount: 1 }, $set: { lastWorn: new Date() } }
      );
    }

    await outfit.save();
    await Promise.all([cacheDeleteByPrefix(`outfits:${userId}`), cacheDeleteByPrefix(`wardrobe:${userId}`)]);

    return feedback;
  },

  list(userId: string) {
    return feedbackRepository.findForUser(userId);
  }
};
