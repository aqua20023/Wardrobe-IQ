import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button } from "../../../components/ui/Button";
import { EditorialText } from "../../../components/ui/EditorialText";
import { PressableScale } from "../../../components/ui/PressableScale";
import { Screen } from "../../../components/ui/Screen";
import { useAuthStore } from "../../../stores/authStore";
import { colors, radii, shadows, spacing } from "../../../theme/editorial";

const slides = [
  {
    eyebrow: "Private Archive",
    title: "Your wardrobe, edited like a collection.",
    body: "Capture each piece with context, AI metadata, and the quiet hierarchy of a fashion archive."
  },
  {
    eyebrow: "Stylist Intelligence",
    title: "Generate looks with taste, weather, and intent.",
    body: "Occasion, mood, season, and fabric signals come together as curated outfits, not commerce tiles."
  },
  {
    eyebrow: "Luxury AI",
    title: "Complete the look with intelligent restraint.",
    body: "Find the missing accessory, layer, or shoe that elevates the silhouette while preserving your style."
  }
];

export function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const slide = slides[index];
  const last = index === slides.length - 1;

  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <View>
          <View style={styles.heroFrame}>
            <View style={styles.innerFrame}>
              <View style={styles.rail} />
              <View style={styles.garment} />
              <View style={styles.scanLine} />
            </View>
          </View>
          <EditorialText variant="label" tone="gold" uppercase style={styles.eyebrow}>
            {slide.eyebrow}
          </EditorialText>
          <EditorialText variant="hero" style={styles.title}>
            {slide.title}
          </EditorialText>
          <EditorialText variant="body" tone="ivoryMuted" style={styles.body}>
            {slide.body}
          </EditorialText>
        </View>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {slides.map((_, dotIndex) => (
              <View key={dotIndex} style={[styles.dot, dotIndex === index ? styles.dotActive : null]} />
            ))}
          </View>
          <Button label={last ? "Get Started" : "Next"} icon="arrow-forward" onPress={() => (last ? completeOnboarding() : setIndex(index + 1))} />
          {!last ? (
            <PressableScale onPress={completeOnboarding} style={styles.skip}>
              <EditorialText variant="label" tone="silver" uppercase>
                Skip
              </EditorialText>
            </PressableScale>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingTop: spacing.md,
    paddingBottom: spacing.xl
  },
  heroFrame: {
    height: 330,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.charcoal,
    padding: spacing.lg,
    overflow: "hidden",
    ...shadows.floating
  },
  innerFrame: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: colors.espresso
  },
  rail: {
    position: "absolute",
    top: 26,
    left: 26,
    right: 26,
    height: 3,
    backgroundColor: colors.gold,
    opacity: 0.72
  },
  garment: {
    width: "58%",
    height: "68%",
    borderTopLeftRadius: 72,
    borderTopRightRadius: 72,
    backgroundColor: colors.espressoSoft,
    borderWidth: 1,
    borderColor: "rgba(245,242,237,0.1)"
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "45%",
    height: 1,
    backgroundColor: colors.gold,
    opacity: 0.42
  },
  eyebrow: {
    marginTop: spacing.xxl
  },
  title: {
    marginTop: spacing.md
  },
  body: {
    marginTop: spacing.lg
  },
  footer: {
    gap: spacing.lg
  },
  dots: {
    flexDirection: "row",
    gap: spacing.sm
  },
  dot: {
    height: 3,
    flex: 1,
    backgroundColor: colors.graphite
  },
  dotActive: {
    backgroundColor: colors.gold
  },
  skip: {
    height: 46,
    alignItems: "center",
    justifyContent: "center"
  }
});
