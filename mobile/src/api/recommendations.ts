import { apiClient } from "./client";
import type { ApiEnvelope, Occasion, OutfitSuggestion, WardrobeCategory } from "../types/domain";

export const recommendationsApi = {
  async outfits(params: { weather?: string; occasion?: Occasion; category?: WardrobeCategory; limit?: number } = {}) {
    const response = await apiClient.get<ApiEnvelope<OutfitSuggestion[]>>("/recommendations/outfits", { params });
    return response.data.data;
  }
};
