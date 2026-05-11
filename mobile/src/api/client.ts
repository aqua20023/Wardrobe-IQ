import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { tokenStorage } from "./tokenStorage";
import type { ApiEnvelope, AuthTokens, User } from "../types/domain";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (__DEV__
    ? "http://10.0.2.2:4000/api/v1"
    : "https://wardrobe-iq-api.onrender.com/api/v1");
console.log("[INIT] process.env.EXPO_PUBLIC_API_URL:", process.env.EXPO_PUBLIC_API_URL);
console.log("[INIT] resolved baseURL:", API_URL);

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 65000 // 30s to survive Render cold starts
});
console.log("[INIT] final axios baseURL:", apiClient.defaults.baseURL);

let refreshPromise: Promise<AuthTokens | null> | null = null;

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  console.log("[REQ_START] method:", config.method);
  console.log("[REQ_START] baseURL:", config.baseURL);
  console.log("[REQ_START] url:", config.url);
  console.log("[REQ_START] final full URL:", `${config.baseURL ?? ""}${config.url ?? ""}`);
  console.log("[REQ_START] headers:", config.headers);
  console.log("[REQ_START] timeout:", config.timeout);
  
  const tokens = await tokenStorage.getTokens();
  if (tokens?.accessToken) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    console.log("[REQ_ERROR] message:", error.message);
    console.log("[REQ_ERROR] code:", error.code);
    console.log("[REQ_ERROR] name:", error.name);
    console.log("[REQ_ERROR] error.config?.baseURL:", error.config?.baseURL);
    console.log("[REQ_ERROR] error.config?.url:", error.config?.url);
    console.log("[REQ_ERROR] error.config?.method:", error.config?.method);
    console.log("[REQ_ERROR] error.response?.status:", error.response?.status);
    console.log("[REQ_ERROR] error.response?.data:", error.response?.data);
    console.log("[REQ_ERROR] full serialized axios error:", JSON.stringify(error, null, 2));
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
    if (error.code === "ECONNABORTED" || error.message.includes("timeout")) {
      return "Server is waking up. Please try again in a few seconds.";
    }
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message;
  }
  return "Something went wrong. Please try again.";
}
