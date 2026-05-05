import { Types } from "mongoose";
import { ClothingItemModel } from "../wardrobe/clothingItem.model";
import { OutfitModel } from "../outfits/outfit.model";

export const analyticsService = {
  async wardrobeStats(userId: string) {
    const objectUserId = new Types.ObjectId(userId);
    const [itemCount, outfitCount, favoriteItemCount, savedOutfitCount, byCategory, byOccasion, mostUsedItems, leastUsedItems] =
      await Promise.all([
        ClothingItemModel.countDocuments({ userId }),
        OutfitModel.countDocuments({ userId }),
        ClothingItemModel.countDocuments({ userId, tags: "favorite" }),
        OutfitModel.countDocuments({ userId, saved: true }),
        ClothingItemModel.aggregate([
          { $match: { userId: objectUserId } },
          { $group: { _id: "$category", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        ClothingItemModel.aggregate([
          { $match: { userId: objectUserId } },
          { $unwind: "$occasion" },
          { $group: { _id: "$occasion", count: { $sum: 1 } } },
          { $sort: { count: -1 } }
        ]),
        ClothingItemModel.find({ userId }).sort({ usageCount: -1 }).limit(5).lean(),
        ClothingItemModel.find({ userId }).sort({ usageCount: 1, createdAt: -1 }).limit(5).lean()
      ]);

    return {
      itemCount,
      outfitCount,
      favoriteItemCount,
      savedOutfitCount,
      byCategory,
      byOccasion,
      mostUsedItems,
      leastUsedItems
    };
  }
};
