import { apiClient } from "./client";
import type { ApiEnvelope, User } from "../types/domain";

export const usersApi = {
  async updateProfile(input: Partial<Pick<User, "name" | "avatar" | "styleProfile">>) {
    const response = await apiClient.patch<ApiEnvelope<User>>("/users/me", input);
    return response.data.data;
  },

  async updatePreferences(input: NonNullable<User["preferences"]>) {
    const response = await apiClient.patch<ApiEnvelope<User["preferences"]>>("/users/me/preferences", input);
    return response.data.data;
  }
};
