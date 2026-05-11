import { useQuery } from "@tanstack/react-query";
import { Image, StyleSheet, View } from "react-native";
import { analyticsApi } from "../../../api/analytics";
import { EmptyState } from "../../../components/ui/EmptyState";
import { EditorialCard, ProgressBar, SectionHeader, StatTile } from "../../../components/ui/EditorialPrimitives";
import { EditorialText } from "../../../components/ui/EditorialText";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";
import { Screen } from "../../../components/ui/Screen";
import { colors, radii, spacing } from "../../../theme/editorial";

export function AnalyticsScreen() {
  const stats = useQuery({ queryKey: ["analytics", "wardrobe"], queryFn: analyticsApi.wardrobe });

  if (stats.isLoading) {
    return (
      <Screen>
        <LoadingSkeleton rows={5} />
      </Screen>
    );
  }

  if (!stats.data) {
    return (
      <Screen>
        <EmptyState title="No analytics yet" body="Add wardrobe pieces to build usage and balance metrics." />
      </Screen>
    );
  }

  const itemCount = stats.data.itemCount || 1;
  const score = Math.min(98, Math.round(((stats.data.itemCount + stats.data.outfitCount + stats.data.savedOutfitCount) / Math.max(1, stats.data.itemCount + 8)) * 100));

  return (
    <Screen>
      <EditorialText variant="label" tone="gold" uppercase>
        Wardrobe Analytics
      </EditorialText>
      <EditorialText variant="headline" style={styles.title}>
        Collection intelligence.
      </EditorialText>
      <EditorialText variant="bodySmall" tone="ivoryMuted" style={styles.subtitle}>
        Minimal signals for rotation, balance, color use, and seasonal readiness.
      </EditorialText>

      <View style={styles.scoreCard}>
        <View style={styles.scoreRing}>
          <EditorialText variant="hero">{score}</EditorialText>
          <EditorialText variant="label" tone="gold" uppercase>
            Score
          </EditorialText>
        </View>
        <View style={{ flex: 1 }}>
          <ProgressBar value={score} label="Wardrobe Score" detail="A blended read of item coverage, outfits, and saved looks." />
        </View>
      </View>

      <View style={styles.statsRow}>
        <StatTile label="Items" value={stats.data.itemCount} icon="shirt-outline" />
        <StatTile label="Outfits" value={stats.data.outfitCount} icon="layers-outline" />
        <StatTile label="Favorites" value={stats.data.favoriteItemCount} icon="heart-outline" />
      </View>

      <View style={styles.section}>
        <SectionHeader title="Category Balance" />
        <EditorialCard style={styles.chartCard}>
          {stats.data.byCategory.map((category) => (
            <ProgressBar
              key={category._id}
              value={(category.count / itemCount) * 100}
              label={category._id || "Other"}
              detail={`${category.count} pieces`}
            />
          ))}
        </EditorialCard>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Occasion Pattern" />
        <EditorialCard style={styles.chartCard}>
          {stats.data.byOccasion.map((occasion) => (
            <ProgressBar
              key={occasion._id}
              value={(occasion.count / itemCount) * 100}
              label={occasion._id || "General"}
              detail={`${occasion.count} wardrobe signals`}
            />
          ))}
        </EditorialCard>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Most Worn" />
        <View style={styles.itemRow}>
          {stats.data.mostUsedItems.slice(0, 3).map((item) => (
            <EditorialCard key={item.id ?? item._id} style={styles.itemCard}>
              <Image source={{ uri: item.imageUrl }} style={styles.itemImage} resizeMode="cover" />
              <View style={styles.itemMeta}>
                <EditorialText variant="caption" numberOfLines={1}>
                  {item.subcategory || item.category}
                </EditorialText>
                <EditorialText variant="label" tone="gold" uppercase>
                  {item.usageCount} wears
                </EditorialText>
              </View>
            </EditorialCard>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Least Worn" />
        <EditorialCard style={styles.chartCard}>
          {stats.data.leastUsedItems.slice(0, 4).map((item) => (
            <View key={item.id ?? item._id} style={styles.unusedRow}>
              <EditorialText variant="bodySmall" style={{ flex: 1 }} numberOfLines={1}>
                {item.subcategory || item.category}
              </EditorialText>
              <EditorialText variant="caption" tone="dim">
                {item.usageCount} wears
              </EditorialText>
            </View>
          ))}
        </EditorialCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.sm
  },
  subtitle: {
    marginTop: spacing.sm
  },
  scoreCard: {
    marginTop: spacing.xxl,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    backgroundColor: colors.charcoal,
    padding: spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xl
  },
  scoreRing: {
    width: 118,
    height: 118,
    borderRadius: 59,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.black
  },
  statsRow: {
    marginTop: spacing.xl,
    flexDirection: "row",
    gap: spacing.md
  },
  section: {
    marginTop: spacing.section
  },
  chartCard: {
    padding: spacing.xl,
    gap: spacing.lg
  },
  itemRow: {
    flexDirection: "row",
    gap: spacing.md
  },
  itemCard: {
    flex: 1,
    minHeight: 180
  },
  itemImage: {
    height: 118,
    width: "100%"
  },
  itemMeta: {
    padding: spacing.md,
    gap: spacing.sm
  },
  unusedRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  }
});

