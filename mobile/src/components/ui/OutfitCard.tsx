import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, View } from "react-native";
import { colors, radii, shadows, spacing } from "../../theme/editorial";
import type { ClothingItem, Outfit, OutfitSuggestion } from "../../types/domain";
import { EditorialText } from "./EditorialText";
import { PressableScale } from "./PressableScale";

type OutfitLike = Outfit | OutfitSuggestion;

function getItems(outfit: OutfitLike): ClothingItem[] {
  if ("items" in outfit) return outfit.items;
  return outfit.itemIds.filter((item): item is ClothingItem => typeof item !== "string");
}

type OutfitCardProps = {
  outfit: OutfitLike;
  onPress?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  onSave?: () => void;
};

export function OutfitCard({ outfit, onPress, onLike, onDislike, onSave }: OutfitCardProps) {
  const items = getItems(outfit).slice(0, 4);
  const confidence = "confidence" in outfit ? Math.round(outfit.confidence * 100) : undefined;

  return (
    <PressableScale onPress={onPress} style={styles.card} accessibilityRole={onPress ? "button" : undefined}>
      <View style={styles.imageGrid}>
        {items.length ? (
          items.map((item) => <Image key={item.id ?? item._id} source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />)
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="layers-outline" color={colors.gold} size={24} />
          </View>
        )}
      </View>
      <View style={styles.metaRow}>
        <View style={{ flex: 1 }}>
          <EditorialText variant="label" tone="gold" uppercase>
            {"weather" in outfit ? `${outfit.weather} / ${outfit.occasion}` : outfit.occasion}
          </EditorialText>
          <EditorialText variant="headlineSmall" style={styles.title}>
            {outfit.title}
          </EditorialText>
        </View>
        {confidence ? (
          <View style={styles.score}>
            <Ionicons name="star" color={colors.gold} size={13} />
            <EditorialText variant="caption">{confidence}%</EditorialText>
          </View>
        ) : null}
      </View>
      {"reason" in outfit ? (
        <EditorialText variant="bodySmall" tone="ivoryMuted" style={styles.reason}>
          {outfit.reason}
        </EditorialText>
      ) : null}
      <View style={styles.actions}>
        {onLike ? (
          <PressableScale onPress={onLike} style={styles.actionButton} accessibilityRole="button">
            <Ionicons name="thumbs-up-outline" size={18} color={colors.ivory} />
          </PressableScale>
        ) : null}
        {onDislike ? (
          <PressableScale onPress={onDislike} style={styles.actionButton} accessibilityRole="button">
            <Ionicons name="thumbs-down-outline" size={18} color={colors.ivory} />
          </PressableScale>
        ) : null}
        {onSave ? (
          <PressableScale onPress={onSave} style={styles.actionButton} accessibilityRole="button">
            <Ionicons name={outfit.saved ? "bookmark" : "bookmark-outline"} size={18} color={colors.gold} />
          </PressableScale>
        ) : null}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.charcoal,
    padding: spacing.lg,
    ...shadows.soft
  },
  imageGrid: {
    flexDirection: "row",
    gap: spacing.sm,
    minHeight: 92
  },
  image: {
    height: 92,
    flex: 1,
    borderRadius: radii.md,
    backgroundColor: colors.graphite
  },
  imagePlaceholder: {
    height: 92,
    flex: 1,
    borderRadius: radii.md,
    backgroundColor: colors.matte,
    alignItems: "center",
    justifyContent: "center"
  },
  metaRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md
  },
  title: {
    marginTop: spacing.sm
  },
  score: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    paddingHorizontal: 9,
    paddingVertical: 6,
    backgroundColor: colors.black
  },
  reason: {
    marginTop: spacing.md
  },
  actions: {
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.md
  },
  actionButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.black,
    borderWidth: 1,
    borderColor: colors.border
  }
});
