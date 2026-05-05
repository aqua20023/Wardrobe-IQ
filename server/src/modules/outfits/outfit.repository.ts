import type { FilterQuery, UpdateQuery } from "mongoose";
import { OutfitModel, type Outfit } from "./outfit.model";

export const outfitRepository = {
  create(data: Record<string, unknown>) {
    return OutfitModel.create(data);
  },

  findByIdForUser(id: string, userId: string) {
    return OutfitModel.findOne({ _id: id, userId }).populate("itemIds");
  },

  async findForUser(filter: FilterQuery<Outfit>, options: { page: number; limit: number }) {
    const skip = (options.page - 1) * options.limit;
    const [outfits, total] = await Promise.all([
      OutfitModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(options.limit).populate("itemIds"),
      OutfitModel.countDocuments(filter)
    ]);

    return {
      outfits,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        pages: Math.ceil(total / options.limit)
      }
    };
  },

  updateByIdForUser(id: string, userId: string, update: UpdateQuery<Outfit>) {
    return OutfitModel.findOneAndUpdate({ _id: id, userId }, update, {
      new: true,
      runValidators: true
    }).populate("itemIds");
  },

  deleteByIdForUser(id: string, userId: string) {
    return OutfitModel.findOneAndDelete({ _id: id, userId });
  }
};
