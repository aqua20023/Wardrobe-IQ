import { apiClient } from "./client";

export const feedbackApi = {
  async create(input: { outfitId: string; action: "like" | "dislike" | "save" | "worn" }) {
    const response = await apiClient.post("/feedback", input);
    return response.data;
  }
};
