import { apiClient } from "./client";
import type { ApiEnvelope } from "../types/domain";

export type ChatResponse = {
  id: string;
  role: "assistant";
  content: string;
  receivedPrompt: string;
  suggestedPrompts: string[];
  metadata: Record<string, unknown>;
};

export const chatApi = {
  async message(message: string) {
    const response = await apiClient.post<ApiEnvelope<ChatResponse>>("/chat/message", { message });
    return response.data.data;
  }
};
