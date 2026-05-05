import { apiClient } from "./client";
import type { ApiEnvelope, Occasion, Outfit, PaginatedOutfits } from "../types/domain";

export type OutfitInput = {
  title: string;
  itemIds: string[];
  occasion: Occasion;
  notes?: string;
  saved?: boolean;
};

export const outfitsApi = {
  async list(params: { saved?: boolean; liked?: boolean; occasion?: Occasion } = {}) {
    const response = await apiClient.get<ApiEnvelope<PaginatedOutfits>>("/outfits", { params });
    return response.data.data;
  },

  async detail(id: string) {
    const response = await apiClient.get<ApiEnvelope<Outfit>>(`/outfits/${id}`);
    return response.data.data;
  },

  async create(input: OutfitInput) {
    const response = await apiClient.post<ApiEnvelope<Outfit>>("/outfits", input);
    return response.data.data;
  },

  async update(id: string, input: Partial<OutfitInput>) {
    const response = await apiClient.patch<ApiEnvelope<Outfit>>(`/outfits/${id}`, input);
    return response.data.data;
  },

  async remove(id: string) {
    await apiClient.delete(`/outfits/${id}`);
  }
};
