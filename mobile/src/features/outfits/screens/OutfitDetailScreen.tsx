import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Image, StyleSheet, View } from "react-native";
import { Button } from "../../../components/ui/Button";
import { EditorialCard, ProgressBar, SectionHeader } from "../../../components/ui/EditorialPrimitives";
import { EditorialText } from "../../../components/ui/EditorialText";
import { Screen } from "../../../components/ui/Screen";
import type { RootStackParamList } from "../../../navigation/types";
import { colors, radii, shadows, spacing } from "../../../theme/editorial";

type Props = NativeStackScreenProps<RootStackParamList, "OutfitDetail">;

export function OutfitDetailScreen({ route, navigation }: Props) {
  const { title, occasion, weather, confidence = 0.92, reason, imageUrls = [], itemLabels = [] } = route.params;
  const score = Math.round(confidence * 100);

  return (
    <Screen>
      <View style={styles.hero}>
        {imageUrls[0] ? <Image source={{ uri: imageUrls[0] }} style={styles.heroImage} resizeMode="cover" /> : null}
        <View style={styles.heroShade} />
        <View style={styles.heroBadge}>
          <Ionicons name="star" size={14} color={colors.gold} />
          <EditorialText variant="caption">{score}% Match</EditorialText>
        </View>
        <View style={styles.heroText}>
          <EditorialText variant="label" tone="gold" uppercase>
            Curated Look
          </EditorialText>
          <EditorialText variant="hero" style={styles.title}>
            {title}
          </EditorialText>
        </View>
      </View>

      <View style={styles.quote}>
        <View style={styles.rule} />
        <EditorialText variant="body" tone="ivoryMuted">
          "{reason || "A measured composition balancing proportion, texture, and visual weight. The look is polished without feeling overworked."}"
        </EditorialText>
      </View>

      <EditorialCard style={styles.analysis}>
        <SectionHeader eyebrow={weather} title={`${occasion ?? "Daily"} Intelligence`} />
        <ProgressBar value={score} label="Compatibility Score" detail="Based on occasion, item coverage, weather, and saved wardrobe signals." />
        <ProgressBar value={82} label="Color Harmony" detail="Warm neutrals and charcoal anchors keep the palette editorial." />
        <ProgressBar value={76} label="Layering Strength" detail="Add a subtle accessory or outer layer to increase depth." />
      </EditorialCard>

      <View style={styles.section}>
        <SectionHeader title="Pieces" />
        <View style={styles.grid}>
          {imageUrls.map((imageUrl, index) => (
            <EditorialCard key={`${imageUrl}-${index}`} style={index === 0 ? styles.largePiece : styles.piece}>
              <Image source={{ uri: imageUrl }} style={styles.pieceImage} resizeMode="cover" />
              <View style={styles.pieceShade} />
              <View style={styles.pieceText}>
                <EditorialText variant="caption" tone="ivoryMuted" numberOfLines={2}>
                  {itemLabels[index] ?? "Wardrobe Piece"}
                </EditorialText>
              </View>
            </EditorialCard>
          ))}
        </View>
      </View>

      <EditorialCard style={styles.note}>
        <View style={styles.noteHeader}>
          <Ionicons name="sparkles-outline" size={20} color={colors.gold} />
          <EditorialText variant="label" uppercase>
            Stylist's Note
          </EditorialText>
        </View>
        <EditorialText variant="body" tone="ivoryMuted" style={styles.noteBody}>
          Add silver accessories to create a cleaner focal point and improve visual balance. A textured layer will add cinematic depth without overwhelming the silhouette.
        </EditorialText>
      </EditorialCard>

      <View style={styles.actions}>
        <Button label="Enhance Look" icon="sparkles-outline" onPress={() => navigation.navigate("PremiumRecommendations")} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 500,
    borderRadius: radii.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.charcoal,
    ...shadows.floating
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%"
  },
  heroShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.46)"
  },
  heroBadge: {
    position: "absolute",
    right: spacing.md,
    top: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    backgroundColor: "rgba(11,11,10,0.78)",
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  heroText: {
    marginTop: "auto",
    padding: spacing.xxl
  },
  title: {
    marginTop: spacing.md
  },
  quote: {
    marginTop: spacing.xxl,
    flexDirection: "row",
    gap: spacing.lg
  },
  rule: {
    width: 2,
    backgroundColor: colors.gold
  },
  analysis: {
    marginTop: spacing.section,
    padding: spacing.xl,
    gap: spacing.lg
  },
  section: {
    marginTop: spacing.section
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: spacing.md
  },
  largePiece: {
    width: "100%",
    height: 250
  },
  piece: {
    width: "48%",
    height: 180
  },
  pieceImage: {
    width: "100%",
    height: "100%"
  },
  pieceShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)"
  },
  pieceText: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md
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
  noteBody: {
    marginTop: spacing.lg
  },
  actions: {
    marginTop: spacing.xl
  }
});

