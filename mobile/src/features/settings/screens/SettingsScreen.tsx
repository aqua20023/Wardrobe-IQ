import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Switch, View } from "react-native";
import { useState } from "react";
import { EditorialCard, SectionHeader } from "../../../components/ui/EditorialPrimitives";
import { EditorialText } from "../../../components/ui/EditorialText";
import { Screen } from "../../../components/ui/Screen";
import { colors, radii, spacing } from "../../../theme/editorial";

const sections = [
  { icon: "shield-checkmark-outline", title: "Authentication", body: "JWT tokens and refresh behavior remain managed by the existing API client." },
  { icon: "cloud-upload-outline", title: "Uploads", body: "Image intake continues through the current Cloudinary-backed wardrobe endpoints." },
  { icon: "analytics-outline", title: "AI Contracts", body: "Prediction and chat payloads are unchanged for backend compatibility." }
] as const;

export function SettingsScreen() {
  const [haptics, setHaptics] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [dailyBrief, setDailyBrief] = useState(true);

  return (
    <Screen>
      <EditorialText variant="label" tone="gold" uppercase>
        System
      </EditorialText>
      <EditorialText variant="headline" style={styles.title}>
        Settings
      </EditorialText>
      <EditorialText variant="bodySmall" tone="ivoryMuted" style={styles.subtitle}>
        Frontend preferences only. Backend routes, schemas, and AI service contracts are preserved.
      </EditorialText>

      <View style={styles.section}>
        <SectionHeader title="Interface" />
        <EditorialCard style={styles.card}>
          <SettingToggle label="Subtle haptics" value={haptics} onValueChange={setHaptics} />
          <SettingToggle label="Reduced motion" value={reducedMotion} onValueChange={setReducedMotion} />
          <SettingToggle label="Daily style brief" value={dailyBrief} onValueChange={setDailyBrief} />
        </EditorialCard>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Compatibility" />
        <View style={styles.stack}>
          {sections.map((section) => (
            <EditorialCard key={section.title} style={styles.compatCard}>
              <Ionicons name={section.icon} size={22} color={colors.gold} />
              <View style={{ flex: 1 }}>
                <EditorialText variant="subtitle">{section.title}</EditorialText>
                <EditorialText variant="bodySmall" tone="stone" style={styles.compatBody}>
                  {section.body}
                </EditorialText>
              </View>
            </EditorialCard>
          ))}
        </View>
      </View>
    </Screen>
  );
}

function SettingToggle({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <EditorialText variant="subtitle" style={{ flex: 1 }}>
        {label}
      </EditorialText>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ false: colors.graphite, true: colors.goldSoft }} thumbColor={colors.ivory} />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: spacing.sm
  },
  subtitle: {
    marginTop: spacing.sm
  },
  section: {
    marginTop: spacing.section
  },
  card: {
    paddingHorizontal: spacing.xl
  },
  toggleRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  stack: {
    gap: spacing.md
  },
  compatCard: {
    minHeight: 112,
    padding: spacing.lg,
    borderRadius: radii.lg,
    flexDirection: "row",
    gap: spacing.lg
  },
  compatBody: {
    marginTop: spacing.sm
  }
});

