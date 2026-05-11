import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useQuery } from "@tanstack/react-query";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { analyticsApi } from "../../../api/analytics";
import { wardrobeApi } from "../../../api/wardrobe";
import { EmptyState } from "../../../components/ui/EmptyState";
import { AppHeader, EditorialCard, ProgressBar, SectionHeader, StatTile } from "../../../components/ui/EditorialPrimitives";
import { EditorialText } from "../../../components/ui/EditorialText";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";
import { Screen } from "../../../components/ui/Screen";
import { WardrobeItemCard } from "../../../components/ui/WardrobeItemCard";
import type { RootStackParamList } from "../../../navigation/types";
import { useAuthStore } from "../../../stores/authStore";
import { useWeatherStore } from "../../../stores/weatherStore";
import { WeatherWidget } from "../../../components/weather/WeatherWidget";
import { WeatherAtmosphere } from "../../../components/weather/WeatherEffects";
import { colors, radii, shadows, spacing } from "../../../theme/editorial";

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((state) => state.user);
  const stats = useQuery({ queryKey: ["analytics", "wardrobe"], queryFn: analyticsApi.wardrobe });
  const recent = useQuery({ queryKey: ["wardrobe", "recent"], queryFn: () => wardrobeApi.list({ sort: "newest" }) });
  const recentItems = recent.data?.items ?? [];
  const heroItem = recentItems[0];
  const activeRotation = stats.data?.itemCount
    ? Math.min(95, Math.round(((stats.data.itemCount - (stats.data.leastUsedItems?.length ?? 0)) / stats.data.itemCount) * 100))
    : 80;

  const currentWeather = useWeatherStore((state) => state.currentWeather);

  return (
    <View style={styles.root}>
      <WeatherAtmosphere condition={currentWeather?.type} />
      <AppHeader onMenuPress={() => navigation.navigate("Settings")} onProfilePress={() => navigation.navigate("Profile")} />
      <Screen edges={["bottom", "left", "right"]}>
        <View style={styles.intro}>
          <WeatherWidget />
          <EditorialText variant="headline" style={styles.headline}>
            Style Insight
          </EditorialText>
          <EditorialText variant="body" tone="ivoryMuted" style={styles.copy}>
            {user?.name?.split(" ")[0] ? `${user.name.split(" ")[0]}, ` : ""}embrace layered textures today. A tailored outer shell over fine-gauge knitwear reads intelligent, warm, and rain-ready.
          </EditorialText>
        </View>

        <View style={styles.statsRow}>
          <StatTile label="Items" value={stats.data?.itemCount ?? 0} icon="shirt-outline" detail="Catalogued" />
          <StatTile label="Outfits" value={stats.data?.outfitCount ?? 0} icon="albums-outline" detail="Composed" />
          <StatTile label="Saved" value={stats.data?.savedOutfitCount ?? 0} icon="bookmark-outline" detail="Pinned" />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Curatorial Health" action="View Metrics" onAction={() => navigation.navigate("Analytics")} />
          <EditorialCard style={styles.healthCard}>
            <View style={styles.scoreRing}>
              <EditorialText variant="headlineSmall">{activeRotation}%</EditorialText>
            </View>
            <View style={styles.healthBars}>
              <ProgressBar value={activeRotation} label="Active Rotation" detail="Your collection is highly functional." />
              <ProgressBar value={Math.max(8, 100 - activeRotation)} label="Archive / Seasonal" />
            </View>
          </EditorialCard>
        </View>

        <View style={styles.quickActions}>
          <ActionTile icon="scan-outline" label="AI Scan" onPress={() => navigation.navigate("MainTabs", { screen: "AIScan" })} />
          <ActionTile icon="sparkles-outline" label="Enhance" onPress={() => navigation.navigate("PremiumRecommendations")} />
          <ActionTile icon="search-outline" label="AI Search" onPress={() => navigation.navigate("AiSearch")} />
        </View>

        <View style={styles.section}>
          <SectionHeader title="The Edit" />
          {heroItem ? (
            <Pressable onPress={() => navigation.navigate("ClothingDetail", { itemId: heroItem.id ?? heroItem._id! })} style={styles.editCard}>
              <Image source={{ uri: heroItem.imageUrl }} style={styles.editImage} resizeMode="cover" />
              <View style={styles.editShade} />
              <View style={styles.editText}>
                <EditorialText variant="label" tone="gold" uppercase>
                  Signature
                </EditorialText>
                <EditorialText variant="hero" style={styles.editTitle} numberOfLines={2}>
                  {heroItem.subcategory || "Midtown Silhouette"}
                </EditorialText>
                <EditorialText variant="bodySmall" tone="ivoryMuted" style={styles.copy}>
                  A masterclass in proportions. Build today around this anchor piece and keep the rest intentionally quiet.
                </EditorialText>
              </View>
            </Pressable>
          ) : recent.isLoading ? (
            <LoadingSkeleton rows={2} />
          ) : (
            <EmptyState title="No wardrobe items yet" body="Add your first piece to unlock AI styling and wardrobe analytics." actionLabel="AI Scan" onAction={() => navigation.navigate("MainTabs", { screen: "AIScan" })} />
          )}
        </View>

        <View style={styles.section}>
          <SectionHeader title="Acquisitions" action="View Archive" onAction={() => navigation.navigate("MainTabs", { screen: "Wardrobe" })} />
          {recent.isLoading ? <LoadingSkeleton rows={2} /> : null}
          <View style={styles.grid}>
            {recentItems.slice(0, 4).map((item) => (
              <WardrobeItemCard key={item.id ?? item._id} item={item} onPress={() => navigation.navigate("ClothingDetail", { itemId: item.id ?? item._id! })} />
            ))}
          </View>
        </View>
      </Screen>
    </View>
  );
}

function ActionTile({ icon, label, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.actionTile}>
      <Ionicons name={icon} size={22} color={colors.gold} />
      <EditorialText variant="label" uppercase style={styles.actionLabel}>
        {label}
      </EditorialText>
      <Ionicons name="arrow-forward" size={15} color={colors.silverSoft} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.black
  },
  intro: {
    paddingTop: spacing.md
  },
  headline: {
    marginTop: spacing.lg
  },
  copy: {
    marginTop: spacing.md
  },
  statsRow: {
    marginTop: spacing.xxl,
    flexDirection: "row",
    gap: spacing.md
  },
  section: {
    marginTop: spacing.section
  },
  healthCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xl,
    padding: spacing.xl
  },
  scoreRing: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.black
  },
  healthBars: {
    flex: 1,
    gap: spacing.lg
  },
  quickActions: {
    marginTop: spacing.xxl,
    flexDirection: "row",
    gap: spacing.md
  },
  actionTile: {
    flex: 1,
    minHeight: 104,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.charcoal,
    padding: spacing.md,
    justifyContent: "space-between"
  },
  actionLabel: {
    marginTop: spacing.md
  },
  editCard: {
    minHeight: 470,
    borderRadius: radii.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.charcoal,
    ...shadows.floating
  },
  editImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%"
  },
  editShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.42)"
  },
  editText: {
    marginTop: "auto",
    padding: spacing.xxl
  },
  editTitle: {
    marginTop: spacing.md
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  }
});

