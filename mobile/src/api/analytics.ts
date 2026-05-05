import { apiClient } from "./client";
import type { ApiEnvelope, ClothingItem } from "../types/domain";

export type WardrobeStats = {
  itemCount: number;
  outfitCount: number;
  favoriteItemCount: number;
  savedOutfitCount: number;
  byCategory: Array<{ _id: string; count: number }>;
  byOccasion: Array<{ _id: string; count: number }>;
  mostUsedItems: ClothingItem[];
  leastUsedItems: ClothingItem[];
};

export const analyticsApi = {
  async wardrobe() {
    const response = await apiClient.get<ApiEnvelope<WardrobeStats>>("/analytics/wardrobe");
    return response.data.data;
  }
};
