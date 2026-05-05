import type { FilterQuery, UpdateQuery } from "mongoose";
import { ClothingItemModel, type ClothingItem } from "./clothingItem.model";

export const wardrobeRepository = {
  create(data: Record<string, unknown>) {
    return ClothingItemModel.create(data);
  },

  findByIdForUser(id: string, userId: string) {
    return ClothingItemModel.findOne({ _id: id, userId });
  },

  async findForUser(filter: FilterQuery<ClothingItem>, options: { page: number; limit: number; sort: Record<string, 1 | -1> }) {
    const skip = (options.page - 1) * options.limit;
    const [items, total] = await Promise.all([
      ClothingItemModel.find(filter).sort(options.sort).skip(skip).limit(options.limit),
      ClothingItemModel.countDocuments(filter)
    ]);

    return {
      items,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
      }
    };
  },

  updateByIdForUser(id: string, userId: string, update: UpdateQuery<ClothingItem>) {
    return ClothingItemModel.findOneAndUpdate({ _id: id, userId }, update, {
      new: true,
      runValidators: true
    });
  },

  deleteByIdForUser(id: string, userId: string) {
    return ClothingItemModel.findOneAndDelete({ _id: id, userId });
  }
};
