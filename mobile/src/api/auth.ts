import { apiClient } from "./client";
import type { ApiEnvelope, AuthTokens, User } from "../types/domain";

type AuthResponse = {
  user: User;
  tokens: AuthTokens;
};

export const authApi = {
  async register(input: { name: string; email: string; password: string }) {
    const response = await apiClient.post<ApiEnvelope<AuthResponse>>("/auth/register", input);
    return response.data.data;
  },

  async login(input: { email: string; password: string }) {
    const response = await apiClient.post<ApiEnvelope<AuthResponse>>("/auth/login", input);
    return response.data.data;
  },

  async forgotPassword(email: string) {
    const response = await apiClient.post<ApiEnvelope<{ resetToken: string | null }>>("/auth/forgot-password", { email });
    return response.data;
  },

  async profile() {
    const response = await apiClient.get<ApiEnvelope<User>>("/users/me");
    return response.data.data;
  }
};
