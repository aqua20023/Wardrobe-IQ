import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "./tokenStorage";
import type { ApiEnvelope, AuthTokens, User } from "../types/domain";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000
});

let refreshPromise: Promise<AuthTokens | null> | null = null;

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const tokens = await tokenStorage.getTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status !== 401 || !original || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;
    refreshPromise ??= refreshTokens();
    const tokens = await refreshPromise.finally(() => {
      refreshPromise = null;
    });

    if (!tokens) return Promise.reject(error);

    original.headers.Authorization = `Bearer ${tokens.accessToken}`;
    return apiClient(original);
  }
);

async function refreshTokens() {
  const tokens = await tokenStorage.getTokens();
  if (!tokens?.refreshToken) return null;

  try {
    const response = await axios.post<ApiEnvelope<{ user: User; tokens: AuthTokens }>>(`${API_URL}/auth/refresh`, {
      refreshToken: tokens.refreshToken
    });
    await tokenStorage.setTokens(response.data.data.tokens);
    return response.data.data.tokens;
  } catch {
    await tokenStorage.clearTokens();
    return null;
  }
}

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message;
  }
  return "Something went wrong. Please try again.";
}
