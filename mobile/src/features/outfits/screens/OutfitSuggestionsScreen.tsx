import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type React from "react";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { getApiErrorMessage } from "../../../api/client";
import { Button } from "../../../components/ui/Button";
import { Chip } from "../../../components/ui/Chip";
import { EmptyState } from "../../../components/ui/EmptyState";
import { AppHeader, EditorialCard, SectionHeader } from "../../../components/ui/EditorialPrimitives";
import { EditorialText } from "../../../components/ui/EditorialText";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";
import { OutfitCard } from "../../../components/ui/OutfitCard";
import { Screen } from "../../../components/ui/Screen";
import type { RootStackParamList } from "../../../navigation/types";
import { occasions } from "../../../theme/options";
import { colors, radii, spacing } from "../../../theme/editorial";
import type { Occasion, OutfitSuggestion } from "../../../types/domain";
import { useWeatherStore } from "../../../stores/weatherStore";
import { useCreateOutfit, useOutfitFeedback, useOutfitSuggestions } from "../hooks/useOutfits";

const weatherOptions = ["Rainy", "Cold", "Sunny", "Evening"];
const styleOptions = ["Editorial", "Minimal", "Classic", "Romantic"];
const moodOptions = ["Commanding", "Quiet", "Warm", "Sharp"];

export function OutfitSuggestionsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const currentWeather = useWeatherStore((state) => state.currentWeather);
  
  // Map live weather data to recommended outfit filter tags
  const getDefaultWeatherFilter = () => {
    if (!currentWeather) return "Cold"; // Reasonable fallback for dark academia style
    const type = currentWeather.type;
    if (type === "rainy" || type === "stormy") return "Rainy";
    if (type === "snowy" || type === "misty") return "Cold";
    if (type === "sunny") return "Sunny";
    if (currentWeather.temperature < 15) return "Cold";
    return "Sunny"; 
  };

  const [occasion, setOccasion] = useState<Occasion | undefined>("work");
  const [weather, setWeather] = useState(() => getDefaultWeatherFilter());
  const [style, setStyle] = useState("Editorial");
  const [mood, setMood] = useState("Commanding");
  const [message, setMessage] = useState<string | null>(null);
  const suggestions = useOutfitSuggestions({ occasion, weather, limit: 5 });
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
          setMessage("Feedback stored locally for this recommendation.");
        }
        return;
      }

      await feedback.mutateAsync({ outfitId: suggestion.id, action });
      setMessage(action === "save" ? "Saved outfit." : "Feedback recorded.");
    } catch (error) {
      setMessage(getApiErrorMessage(error));
    }
  }

  function openDetail(suggestion: OutfitSuggestion) {
    navigation.navigate("OutfitDetail", {
      title: suggestion.title,
      occasion: suggestion.occasion,
      weather: suggestion.weather,
      confidence: suggestion.confidence,
      reason: suggestion.reason,
      imageUrls: suggestion.items.map((item) => item.imageUrl),
      itemLabels: suggestion.items.map((item) => item.subcategory || item.category)
    });
  }

  return (
    <View style={styles.root}>
      <AppHeader onMenuPress={() => navigation.navigate("Settings")} onProfilePress={() => navigation.navigate("Profile")} />
      <Screen edges={["bottom", "left", "right"]}>
        <View style={styles.hero}>
          <EditorialText variant="label" tone="gold" uppercase>
            Outfit Generator
          </EditorialText>
          <EditorialText variant="headline" style={styles.title}>
            Curate the silhouette.
          </EditorialText>
          <EditorialText variant="bodySmall" tone="ivoryMuted" style={styles.subtitle}>
            Choose context and let the existing recommendation endpoint assemble a stylist-grade edit.
          </EditorialText>
        </View>

        <EditorialCard style={styles.controls}>
          <ControlGroup label="Occasion">
            <Chip compact label="Any" selected={!occasion} onPress={() => setOccasion(undefined)} />
            {occasions.slice(0, 6).map((value) => (
              <Chip key={value} compact label={value} selected={occasion === value} onPress={() => setOccasion(value)} />
            ))}
          </ControlGroup>
          <ControlGroup label="Weather">
            {weatherOptions.map((value) => (
              <Chip key={value} compact label={value} selected={weather === value} onPress={() => setWeather(value)} />
            ))}
          </ControlGroup>
          <ControlGroup label="Style Aesthetic">
            {styleOptions.map((value) => (
              <Chip key={value} compact label={value} selected={style === value} onPress={() => setStyle(value)} />
            ))}
          </ControlGroup>
          <ControlGroup label="Mood">
            {moodOptions.map((value) => (
              <Chip key={value} compact label={value} selected={mood === value} onPress={() => setMood(value)} />
            ))}
          </ControlGroup>
        </EditorialCard>

        <View style={styles.editorialNote}>
          <View style={styles.goldRule} />
          <EditorialText variant="body" tone="ivoryMuted">
            "{style} direction with a {mood.toLowerCase()} presence. Prioritize proportion, texture, and color harmony over novelty."
          </EditorialText>
        </View>

        {message ? (
          <EditorialText variant="caption" tone="gold" style={styles.message}>
            {message}
          </EditorialText>
        ) : null}

        <View style={styles.section}>
          <SectionHeader title="Generated Looks" action="Manual Build" onAction={() => navigation.navigate("OutfitBuilder", {})} />
          {suggestions.isLoading ? <LoadingSkeleton rows={4} /> : null}
          {!suggestions.isLoading && !suggestions.data?.length ? (
            <EmptyState title="No suggestions yet" body="Add wardrobe items with occasions to generate curated outfit recommendations." />
          ) : (
            <View style={styles.cards}>
              {suggestions.data?.map((suggestion) => (
                <OutfitCard
                  key={suggestion.id}
                  outfit={suggestion}
                  onPress={() => openDetail(suggestion)}
                  onLike={() => sendFeedback(suggestion, "like")}
                  onDislike={() => sendFeedback(suggestion, "dislike")}
                  onSave={() => sendFeedback(suggestion, "save")}
                />
              ))}
            </View>
          )}
        </View>

        <Pressable style={styles.generate} onPress={() => suggestions.refetch()}>
          <Ionicons name="sparkles" color={colors.black} size={18} />
          <EditorialText variant="label" tone="black" uppercase>
            Generate New
          </EditorialText>
        </Pressable>
      </Screen>
    </View>
  );
}

function ControlGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <EditorialText variant="caption" tone="stone" uppercase>
        {label}
      </EditorialText>
      <View style={styles.controlWrap}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.black
  },
  hero: {
    paddingTop: spacing.md
  },
  title: {
    marginTop: spacing.sm
  },
  subtitle: {
    marginTop: spacing.sm
  },
  controls: {
    marginTop: spacing.xxl,
    padding: spacing.lg,
    gap: spacing.lg
  },
  controlWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.sm
  },
  editorialNote: {
    marginTop: spacing.xxl,
    flexDirection: "row",
    gap: spacing.lg
  },
  goldRule: {
    width: 2,
    backgroundColor: colors.gold
  },
  message: {
    marginTop: spacing.lg
  },
  section: {
    marginTop: spacing.section
  },
  cards: {
    gap: spacing.lg
  },
  generate: {
    marginTop: spacing.xxl,
    minHeight: 58,
    borderRadius: radii.lg,
    backgroundColor: colors.gold,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  }
});
