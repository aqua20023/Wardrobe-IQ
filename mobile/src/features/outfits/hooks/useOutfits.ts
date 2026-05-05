import { useMutation, useQuery } from "@tanstack/react-query";
import { feedbackApi } from "../../../api/feedback";
import { outfitsApi, type OutfitInput } from "../../../api/outfits";
import { queryClient } from "../../../api/queryClient";
import { recommendationsApi } from "../../../api/recommendations";
import type { Occasion } from "../../../types/domain";

export const outfitKeys = {
  all: ["outfits"] as const,
  list: (query: Record<string, unknown>) => ["outfits", query] as const,
  suggestions: (query: Record<string, unknown>) => ["recommendations", query] as const
};

export function useOutfits(query: { saved?: boolean; liked?: boolean; occasion?: Occasion } = {}) {
  return useQuery({
    queryKey: outfitKeys.list(query),
    queryFn: () => outfitsApi.list(query)
  });
}

export function useCreateOutfit() {
  return useMutation({
    mutationFn: (input: OutfitInput) => outfitsApi.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: outfitKeys.all })
  });
}

export function useOutfitSuggestions(query: { weather?: string; occasion?: Occasion; limit?: number } = {}) {
  return useQuery({
    queryKey: outfitKeys.suggestions(query),
    queryFn: () => recommendationsApi.outfits(query)
  });
}

export function useOutfitFeedback() {
  return useMutation({
    mutationFn: feedbackApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: outfitKeys.all });
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    }
  });
}
