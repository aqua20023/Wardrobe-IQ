import { StyleSheet, View } from "react-native";
import { EditorialText } from "../../../components/ui/EditorialText";
import { Screen } from "../../../components/ui/Screen";
import { colors, radii, shadows, spacing } from "../../../theme/editorial";

export function SplashScreen() {
  return (
    <Screen scroll={false}>
      <View style={styles.container}>
        <View style={styles.cabinet}>
          <View style={styles.lightRail} />
          <View style={styles.hanger} />
          <View style={styles.coat}>
            <View style={styles.lapelLeft} />
            <View style={styles.lapelRight} />
          </View>
        </View>
        <EditorialText variant="brand" style={styles.brand}>
          WARDROBE IQ
        </EditorialText>
        <EditorialText variant="label" tone="gold" uppercase style={styles.tag}>
          Personal AI Stylist
        </EditorialText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 34
  },
  cabinet: {
    width: 180,
    height: 232,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    backgroundColor: colors.espresso,
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
    ...shadows.floating
  },
  lightRail: {
    position: "absolute",
    top: 18,
    left: 24,
    right: 24,
    height: 3,
    backgroundColor: colors.gold,
    opacity: 0.72
  },
  hanger: {
    position: "absolute",
    top: 62,
    width: 56,
    height: 26,
    borderTopWidth: 2,
    borderColor: colors.silverSoft,
    borderRadius: 32
  },
  coat: {
    width: 116,
    height: 144,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    backgroundColor: "#3b2a1e",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)"
  },
  lapelLeft: {
    position: "absolute",
    top: 0,
    left: 16,
    width: 38,
    height: 80,
    borderRightWidth: 1,
    borderRightColor: "rgba(245,242,237,0.16)",
    transform: [{ skewX: "-16deg" }]
  },
  lapelRight: {
    position: "absolute",
    top: 0,
    right: 16,
    width: 38,
    height: 80,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(245,242,237,0.16)",
    transform: [{ skewX: "16deg" }]
  },
  brand: {
    marginTop: spacing.xxl,
    textAlign: "center"
  },
  tag: {
    marginTop: spacing.sm
  }
});
