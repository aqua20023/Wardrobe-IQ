import { create } from "zustand";
import { authApi } from "../api/auth";
import { queryClient } from "../api/queryClient";
import { tokenStorage } from "../api/tokenStorage";
import type { User } from "../types/domain";

type AuthStatus = "idle" | "loading" | "authenticated" | "guest";

type AuthState = {
  user: User | null;
  status: AuthStatus;
  onboardingComplete: boolean;
  bootstrap: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  signup: (input: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  status: "idle",
  onboardingComplete: false,

  async bootstrap() {
    set({ status: "loading" });
    const [tokens, onboardingComplete] = await Promise.all([tokenStorage.getTokens(), tokenStorage.getOnboardingComplete()]);

    if (!tokens) {
      set({ status: "guest", onboardingComplete });
      return;
    }

    try {
      const user = await authApi.profile();
      set({ user, status: "authenticated", onboardingComplete });
    } catch {
      await tokenStorage.clearTokens();
      set({ user: null, status: "guest", onboardingComplete });
    }
  },

  async completeOnboarding() {
    await tokenStorage.setOnboardingComplete(true);
    set({ onboardingComplete: true });
  },

  async login(input) {
    try {
      const { user, tokens } = await authApi.login(input);
      await tokenStorage.setTokens(tokens);
      set({ user, status: "authenticated" });
    } catch (err: any) {
      if (err?.code === "ECONNABORTED" || err?.message?.includes("Network Error") || err?.code === "ERR_NETWORK") {
        console.warn("[Auth] Cold start retry for login...");
        const { user, tokens } = await authApi.login(input);
        await tokenStorage.setTokens(tokens);
        set({ user, status: "authenticated" });
        return;
      }
      throw err;
    }
  },

  async signup(input) {
    try {
      const { user, tokens } = await authApi.register(input);
      await tokenStorage.setTokens(tokens);
      await get().completeOnboarding();
      set({ user, status: "authenticated" });
    } catch (err: any) {
      if (err?.code === "ECONNABORTED" || err?.message?.includes("Network Error") || err?.code === "ERR_NETWORK") {
        console.warn("[Auth] Cold start retry for signup...");
        const { user, tokens } = await authApi.register(input);
        await tokenStorage.setTokens(tokens);
        await get().completeOnboarding();
        set({ user, status: "authenticated" });
        return;
      }
      throw err;
    }
  },

  async logout() {
    await tokenStorage.clearTokens();
    queryClient.clear();
    set({ user: null, status: "guest" });
  },

  async refreshProfile() {
    const user = await authApi.profile();
    set({ user });
  }
}));
