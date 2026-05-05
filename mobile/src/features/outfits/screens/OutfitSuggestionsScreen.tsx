import { useState } from "react";
import { Text, View } from "react-native";
import { getApiErrorMessage } from "../../../api/client";
import { Chip } from "../../../components/ui/Chip";
import { EmptyState } from "../../../components/ui/EmptyState";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";
import { OutfitCard } from "../../../components/ui/OutfitCard";
import { Screen } from "../../../components/ui/Screen";
import { occasions } from "../../../theme/options";
import type { Occasion, OutfitSuggestion } from "../../../types/domain";
import { useCreateOutfit, useOutfitFeedback, useOutfitSuggestions } from "../hooks/useOutfits";

export function OutfitSuggestionsScreen() {
  const [occasion, setOccasion] = useState<Occasion | undefined>();
  const [message, setMessage] = useState<string | null>(null);
  const suggestions = useOutfitSuggestions({ occasion, limit: 5 });
  const createOutfit = useCreateOutfit();
  const feedback = useOutfitFeedback();

  async function sendFeedback(suggestion: OutfitSuggestion, action: "like" | "dislike" | "save") {
    try {
      setMessage(null);
      if (suggestion.id.startsWith("mock")) {
        if (action === "save") {
          const itemIds = suggestion.items.map((item) => item.id ?? item._id!).filter(Boolean);
          await createOutfit.mutateAsync({
            title: suggestion.title,
            itemIds,
            occasion: suggestion.occasion,
            notes: suggestion.reason,
            saved: true
          });
          setMessage("Saved as a real outfit.");
        } else {
          setMessage("Feedback stored locally for this mock suggestion in Phase 1.");
        }
        return;
      }

      await feedback.mutateAsync({ outfitId: suggestion.id, action });
      setMessage(action === "save" ? "Saved outfit." : "Feedback recorded.");
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  }

  return (
    <Screen>
      <Text className="text-3xl font-semibold text-mist">Suggestions</Text>
      <Text className="mt-2 text-base leading-6 text-stone">Rule-based outfit cards prepared for future recommendation ranking.</Text>

      <View className="mt-5 flex-row flex-wrap">
        <Chip label="Any" selected={!occasion} onPress={() => setOccasion(undefined)} />
        {occasions.slice(0, 6).map((value) => (
          <Chip key={value} label={value} selected={occasion === value} onPress={() => setOccasion(value)} />
        ))}
      </View>

      {message ? <Text className="mt-4 text-sm text-stone">{message}</Text> : null}

      <View className="mt-6 gap-4">
        {suggestions.isLoading ? <LoadingSkeleton rows={4} /> : null}
        {!suggestions.isLoading && !suggestions.data?.length ? (
          <EmptyState title="No suggestions yet" body="Add wardrobe items with occasions to generate rule-based suggestions." />
        ) : (
          suggestions.data?.map((suggestion) => (
            <OutfitCard
              key={suggestion.id}
              outfit={suggestion}
              onLike={() => sendFeedback(suggestion, "like")}
              onDislike={() => sendFeedback(suggestion, "dislike")}
              onSave={() => sendFeedback(suggestion, "save")}
            />
          ))
        )}
      </View>
    </Screen>
  );
}
