import type { chatMessageSchema } from "./chat.validators";
import type { z } from "zod";

type ChatInput = z.infer<typeof chatMessageSchema>;

export const chatService = {
  respond(input: ChatInput) {
    return {
      id: `placeholder-${Date.now()}`,
      role: "assistant",
      content:
        "I can help with outfit planning once NLP is enabled. For now, try the Suggestions tab for rule-based outfit ideas.",
      receivedPrompt: input.message,
      suggestedPrompts: ["Suggest a casual outfit", "What should I wear today?", "Suggest formal look"],
      metadata: {
        aiEnabled: false,
        recommendationReady: true,
        context: input.context ?? {}
      }
    };
  }
};
