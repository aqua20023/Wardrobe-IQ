import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { wardrobeApi } from "../../../api/wardrobe";
import { EditorialCard, ProgressBar, SectionHeader } from "../../../components/ui/EditorialPrimitives";
import { EditorialText } from "../../../components/ui/EditorialText";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";
import { Screen } from "../../../components/ui/Screen";
import { colors, radii, shadows, spacing } from "../../../theme/editorial";

const recommendations = [
  {
    type: "Accessories",
    title: "Minimalist Chronograph",
    boost: "+18% Boost",
    icon: "watch-outline" as const,
    note: "Silver accents create a clean structural anchor against dark tailoring."
  },
  {
    type: "Layering",
    title: "Textured Merino Scarf",
    boost: "+12% Boost",
    icon: "file-tray-stacked-outline" as const,
    note: "Adds tactile contrast and a warmer vertical line."
  },
  {
    type: "Footwear",
    title: "Polished Leather Loafer",
    boost: "+9% Boost",
    icon: "walk-outline" as const,
    note: "Grounds the look with a deliberate editorial finish."
  }
];

export function PremiumRecommendationsScreen() {
  const wardrobe = useQuery({ queryKey: ["wardrobe", "premium-base"], queryFn: () => wardrobeApi.list({ sort: "newest" }) });
  const baseItems = wardrobe.data?.items.slice(0, 2) ?? [];

  return (
    <Screen>
      <EditorialText variant="headline">Complete the Look</EditorialText>
      <EditorialText variant="body" tone="ivoryMuted" style={styles.subtitle}>
        Elevate your current ensemble with curated additions.
      </EditorialText>

      {wardrobe.isLoading ? (
        <LoadingSkeleton rows={2} />
      ) : (
        <EditorialCard style={styles.baseCard}>
          <View style={styles.baseImages}>
            {baseItems.map((item) => (
              <Image key={item.id ?? item._id} source={{ uri: item.imageUrl }} style={styles.baseImage} resizeMode="cover" />
            ))}
            {!baseItems.length ? (
              <View style={styles.basePlaceholder}>
                <Ionicons name="layers-outline" color={colors.gold} size={24} />
              </View>
            ) : null}
          </View>
          <View style={{ flex: 1 }}>
            <EditorialText variant="label" tone="stone" uppercase>
              Current Base
            </EditorialText>
            <EditorialText variant="subtitle" style={styles.baseTitle}>
              Evening Editorial
            </EditorialText>
          </View>
          <View style={styles.score}>
            <EditorialText variant="headlineSmall" tone="gold">
              82%
            </EditorialText>
            <EditorialText variant="caption" tone="ivoryMuted">
              Outfit Score
            </EditorialText>
          </View>
        </EditorialCard>
      )}

      <View style={styles.section}>
        <SectionHeader title="Missing Elements" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendationRail}>
          {recommendations.map((item) => (
            <RecommendationCard key={item.title} {...item} />
          ))}
        </ScrollView>
      </View>

      <EditorialCard style={styles.note}>
        <View style={styles.noteHeader}>
          <Ionicons name="sparkles" color={colors.gold} size={20} />
          <EditorialText variant="label" uppercase>
            Stylist's Note
          </EditorialText>
        </View>
        <EditorialText variant="body" tone="ivoryMuted" style={styles.noteCopy}>
          Your current base provides an excellent silhouette. To break up monochromatic espresso tones, introduce the silver chronograph. This acts as a subtle structural anchor, while a textured layer adds cinematic depth without overwhelming the minimalism of the look.
        </EditorialText>
        <View style={styles.chips}>
          <SmallTag label="Texture Focus" />
          <SmallTag label="Silver Accents" />
        </View>
      </EditorialCard>

      <EditorialCard style={styles.scoreCard}>
        <SectionHeader title="Compatibility Lift" />
        <ProgressBar value={82} label="Current Base" />
        <ProgressBar value={94} label="With Accessories" detail="Adding silver accessories improves visual balance by 18%." />
      </EditorialCard>
    </Screen>
  );
}

function RecommendationCard({ type, title, boost, icon, note }: { type: string; title: string; boost: string; icon: keyof typeof Ionicons.glyphMap; note: string }) {
  return (
    <Pressable style={styles.recommendationCard}>
      <View style={styles.boost}>
        <EditorialText variant="caption" tone="gold">
          {boost}
        </EditorialText>
      </View>
      <View style={styles.productStage}>
        <Ionicons name={icon} color={colors.silver} size={78} />
      </View>
      <View style={styles.recommendationMeta}>
        <EditorialText variant="label" tone="stone" uppercase>
          {type}
        </EditorialText>
        <EditorialText variant="headlineSmall" style={styles.productTitle}>
          {title}
        </EditorialText>
        <EditorialText variant="bodySmall" tone="stone" style={styles.productNote}>
          {note}
        </EditorialText>
        <View style={styles.acquire}>
          <EditorialText variant="label" uppercase>
            Acquire
          </EditorialText>
          <Ionicons name="arrow-forward" color={colors.ivory} size={16} />
        </View>
      </View>
    </Pressable>
  );
}

function SmallTag({ label }: { label: string }) {
  return (
    <View style={styles.smallTag}>
      <EditorialText variant="caption" tone="ivoryMuted" uppercase>
        {label}
      </EditorialText>
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: spacing.sm
  },
  baseCard: {
    marginTop: spacing.section,
    minHeight: 110,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg
  },
  baseImages: {
    width: 118,
    height: 70,
    flexDirection: "row",
    borderRadius: radii.lg,
    overflow: "hidden",
    backgroundColor: colors.black
  },
  baseImage: {
    flex: 1,
    height: "100%"
  },
  basePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  baseTitle: {
    marginTop: spacing.sm
  },
  score: {
    alignItems: "flex-end"
  },
  section: {
    marginTop: spacing.section
  },
  recommendationRail: {
    flexDirection: "row",
    gap: spacing.lg
  },
  recommendationCard: {
    width: 280,
    minHeight: 460,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    backgroundColor: colors.charcoal,
    overflow: "hidden",
    ...shadows.soft
  },
  boost: {
    position: "absolute",
    left: spacing.lg,
    top: spacing.lg,
    zIndex: 2,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(11,11,10,0.72)"
  },
  productStage: {
    height: 250,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.matte
  },
  recommendationMeta: {
    padding: spacing.lg
  },
  productTitle: {
    marginTop: spacing.md
  },
  productNote: {
    marginTop: spacing.sm
  },
  acquire: {
    marginTop: spacing.lg,
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.silverSoft,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  note: {
    marginTop: spacing.section,
    padding: spacing.xl
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  noteCopy: {
    marginTop: spacing.xl
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginTop: spacing.xl
  },
  smallTag: {
    backgroundColor: colors.charcoalHigh,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  scoreCard: {
    marginTop: spacing.section,
    padding: spacing.xl,
    gap: spacing.lg
  }
});
