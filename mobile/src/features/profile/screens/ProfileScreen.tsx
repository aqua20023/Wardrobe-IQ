import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useState } from "react";
import { Pressable, StyleSheet, Switch, View } from "react-native";
import { useMutation } from "@tanstack/react-query";
import { getApiErrorMessage } from "../../../api/client";
import { usersApi } from "../../../api/users";
import { Button } from "../../../components/ui/Button";
import { EditorialCard, SectionHeader } from "../../../components/ui/EditorialPrimitives";
import { EditorialText } from "../../../components/ui/EditorialText";
import { Input } from "../../../components/ui/Input";
import { Screen } from "../../../components/ui/Screen";
import type { RootStackParamList } from "../../../navigation/types";
import { useAuthStore } from "../../../stores/authStore";
import { colors, radii, spacing } from "../../../theme/editorial";

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, logout, refreshProfile } = useAuthStore();
  const [name, setName] = useState(user?.name ?? "");
  const [preferredColors, setPreferredColors] = useState(user?.preferences?.preferredColors?.join(", ") ?? "");
  const [climate, setClimate] = useState(user?.preferences?.climate ?? "");
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.preferences?.notificationsEnabled ?? true);
  const [message, setMessage] = useState<string | null>(null);

  const updateProfile = useMutation({
    mutationFn: async () => {
      await usersApi.updateProfile({ name });
      await usersApi.updatePreferences({
        preferredColors: preferredColors.split(",").map((color) => color.trim()).filter(Boolean),
        climate,
        notificationsEnabled
      });
    },
    onSuccess: async () => {
      await refreshProfile();
      setMessage("Profile updated.");
    },
    onError: (error) => setMessage(getApiErrorMessage(error))
  });

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <EditorialText variant="headlineSmall" tone="black">
            {(user?.name ?? "WI").slice(0, 2).toUpperCase()}
          </EditorialText>
        </View>
        <EditorialText variant="headline" style={styles.name}>
          {user?.name ?? "Wardrobe Client"}
        </EditorialText>
        <EditorialText variant="bodySmall" tone="stone" style={styles.email}>
          {user?.email}
        </EditorialText>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Style Identity" action="Settings" onAction={() => navigation.navigate("Settings")} />
        <EditorialCard style={styles.profileCard}>
          <ProfileMetric label="Preferred Climate" value={climate || "Mixed"} />
          <ProfileMetric label="Color Direction" value={preferredColors || "Ivory, charcoal"} />
          <ProfileMetric label="AI Profile" value={user?.styleProfile?.styleKeywords?.join(", ") || "Minimal editorial"} />
        </EditorialCard>
      </View>

      <EditorialCard style={styles.form}>
        <Input label="Name" value={name} onChangeText={setName} />
        <Input label="Preferred colors" value={preferredColors} onChangeText={setPreferredColors} placeholder="black, ivory, olive" />
        <Input label="Climate" value={climate} onChangeText={setClimate} placeholder="warm, rainy, mixed" />
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <EditorialText variant="subtitle">Notifications</EditorialText>
            <EditorialText variant="caption" tone="stone" style={styles.email}>
              Daily outfit jobs are API-ready.
            </EditorialText>
          </View>
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false: colors.graphite, true: colors.goldSoft }} thumbColor={colors.ivory} />
        </View>
        {message ? (
          <EditorialText variant="caption" tone="gold">
            {message}
          </EditorialText>
        ) : null}
        <Button label="Save Preferences" loading={updateProfile.isPending} onPress={() => updateProfile.mutate()} />
      </EditorialCard>

      <View style={styles.actions}>
        <Pressable style={styles.linkRow} onPress={() => navigation.navigate("PremiumRecommendations")}>
          <Ionicons name="sparkles-outline" size={20} color={colors.gold} />
          <EditorialText variant="subtitle" style={{ flex: 1 }}>
            Premium Recommendations
          </EditorialText>
          <Ionicons name="chevron-forward" size={20} color={colors.silverSoft} />
        </Pressable>
        <Button label="Logout" variant="secondary" icon="log-out-outline" onPress={logout} />
      </View>
    </Screen>
  );
}

function ProfileMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <EditorialText variant="label" tone="stone" uppercase>
        {label}
      </EditorialText>
      <EditorialText variant="bodySmall" style={styles.metricValue} numberOfLines={2}>
        {value}
      </EditorialText>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    paddingTop: spacing.xxl
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.ivory,
    alignItems: "center",
    justifyContent: "center"
  },
  name: {
    marginTop: spacing.xl,
    textAlign: "center"
  },
  email: {
    marginTop: spacing.sm
  },
  section: {
    marginTop: spacing.section
  },
  profileCard: {
    padding: spacing.xl,
    gap: spacing.lg
  },
  metric: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.lg
  },
  metricValue: {
    marginTop: spacing.sm
  },
  form: {
    marginTop: spacing.section,
    padding: spacing.xl,
    gap: spacing.lg
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.charcoalHigh,
    padding: spacing.lg
  },
  actions: {
    marginTop: spacing.xl,
    gap: spacing.md
  },
  linkRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.charcoal,
    paddingHorizontal: spacing.lg
  }
});

