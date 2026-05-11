import { Image, StyleSheet, View } from "react-native";
import { colors, radii, shadows, spacing } from "../../theme/editorial";
import type { ClothingItem } from "../../types/domain";
import { EditorialText } from "./EditorialText";
import { PressableScale } from "./PressableScale";

type WardrobeItemCardProps = {
  item: ClothingItem;
  onPress?: () => void;
  selected?: boolean;
};

export function WardrobeItemCard({ item, onPress, selected }: WardrobeItemCardProps) {
  const confidence = item.aiMetadata?.confidence ? Math.round(item.aiMetadata.confidence * 100) : undefined;
  const displayColor = resolveColor(item.color);

  return (
    <PressableScale onPress={onPress} style={[styles.wrapper, selected ? styles.selected : null]} accessibilityRole={onPress ? "button" : undefined}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        {confidence ? (
          <View style={styles.badge}>
            <IonBadge value={`${confidence}% AI`} />
          </View>
        ) : null}
      </View>
      <View style={styles.meta}>
        <EditorialText variant="label" tone="stone" uppercase numberOfLines={1}>
          {item.category}
        </EditorialText>
        <EditorialText variant="headlineSmall" numberOfLines={2} style={styles.title}>
            {item.subcategory || item.category}
        </EditorialText>
        <View style={styles.detailRow}>
          <View style={[styles.colorDot, { backgroundColor: displayColor }]} />
          <EditorialText variant="caption" tone="dim" numberOfLines={1} style={{ flex: 1 }}>
            {[item.color, item.occasion?.[0]].filter(Boolean).join(" / ")}
          </EditorialText>
        </View>
      </View>
    </PressableScale>
  );
}

function resolveColor(value?: string) {
  if (!value) return colors.graphite;
  if (value.startsWith("#") || value.startsWith("rgb")) return value;
  const key = value.toLowerCase();
  if (key.includes("black")) return "#050505";
  if (key.includes("white") || key.includes("ivory") || key.includes("cream")) return "#eee9dc";
  if (key.includes("brown") || key.includes("espresso")) return colors.espressoSoft;
  if (key.includes("blue") || key.includes("navy")) return "#1b2632";
  if (key.includes("grey") || key.includes("gray")) return "#656764";
  if (key.includes("green") || key.includes("olive")) return "#4d5543";
  if (key.includes("red") || key.includes("burgundy")) return "#6d2635";
  if (key.includes("gold") || key.includes("beige") || key.includes("tan")) return colors.beige;
  return colors.graphite;
}

function IonBadge({ value }: { value: string }) {
  return (
    <View style={styles.aiBadgeInner}>
      <EditorialText variant="caption" tone="gold">
        {value}
      </EditorialText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.xl,
    width: "48%",
    borderRadius: radii.md,
    overflow: "hidden",
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.border
  },
  selected: {
    borderColor: colors.gold,
    ...shadows.soft
  },
  imageWrap: {
    aspectRatio: 0.82,
    backgroundColor: colors.graphite,
    overflow: "hidden"
  },
  image: {
    width: "100%",
    height: "100%"
  },
  badge: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm
  },
  aiBadgeInner: {
    backgroundColor: "rgba(11,11,10,0.72)",
    borderWidth: 1,
    borderColor: colors.borderWarm,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  meta: {
    padding: spacing.md,
    minHeight: 138
  },
  title: {
    marginTop: spacing.sm
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: "auto"
  },
  colorDot: {
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  }
});
