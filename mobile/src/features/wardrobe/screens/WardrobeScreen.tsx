import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Chip } from "../../../components/ui/Chip";
import { EmptyState } from "../../../components/ui/EmptyState";
import { AppHeader } from "../../../components/ui/EditorialPrimitives";
import { EditorialText } from "../../../components/ui/EditorialText";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";
import { Screen } from "../../../components/ui/Screen";
import { WardrobeItemCard } from "../../../components/ui/WardrobeItemCard";
import type { RootStackParamList } from "../../../navigation/types";
import { categories, categoryLabels } from "../../../theme/options";
import { colors, fonts, radii, shadows, spacing } from "../../../theme/editorial";
import type { WardrobeCategory } from "../../../types/domain";
import { useWardrobe } from "../hooks/useWardrobe";

export function WardrobeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [category, setCategory] = useState<WardrobeCategory | undefined>();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "most-used">("newest");

  const query = useMemo(() => ({ category, search: search || undefined, sort }), [category, search, sort]);
  const wardrobe = useWardrobe(query);
  const items = wardrobe.data?.items ?? [];

  return (
    <View style={styles.root}>
      <AppHeader onMenuPress={() => navigation.navigate("Settings")} onProfilePress={() => navigation.navigate("Profile")} />
      <Screen scroll={false} edges={["bottom", "left", "right"]}>
        <View style={styles.hero}>
          <EditorialText variant="headline">The Archive</EditorialText>
          <EditorialText variant="bodySmall" tone="stone" style={styles.subtitle}>
            {wardrobe.data?.pagination.total ?? 0} pieces cataloged with AI-readable context.
          </EditorialText>
        </View>

        <Pressable style={styles.searchShell} onPress={() => navigation.navigate("AiSearch")}>
          <Ionicons name="search-outline" size={24} color={colors.dim} />
          <TextInput
            placeholder="Find my black blazer..."
            placeholderTextColor={colors.dim}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
            returnKeyType="search"
          />
          <Ionicons name="mic-outline" size={22} color={colors.gold} />
        </Pressable>

        <View style={styles.filters}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[undefined, ...categories]}
            keyExtractor={(item) => item ?? "all"}
            renderItem={({ item }) => (
              <Chip
                label={item ? categoryLabels[item] : "All"}
                selected={item === category}
                onPress={() => setCategory(item === category ? undefined : item)}
              />
            )}
          />
        </View>

        <View style={styles.sortRow}>
          <Chip compact label="Newest" selected={sort === "newest"} onPress={() => setSort("newest")} />
          <Chip compact label="Most Worn" selected={sort === "most-used"} onPress={() => setSort("most-used")} />
        </View>

        <View style={styles.listWrap}>
          {wardrobe.isLoading ? <LoadingSkeleton rows={4} /> : null}
          {!wardrobe.isLoading && items.length === 0 ? (
            <EmptyState
              title="No items found"
              body="Add a new item or refine the archive filters."
              actionLabel="AI Scan"
              onAction={() => navigation.navigate("MainTabs", { screen: "AIScan" })}
            />
          ) : (
            <FlatList
              data={items}
              numColumns={2}
              keyExtractor={(item) => item.id ?? item._id!}
              columnWrapperStyle={styles.columns}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.gridContent}
              renderItem={({ item }) => (
                <WardrobeItemCard item={item} onPress={() => navigation.navigate("ClothingDetail", { itemId: item.id ?? item._id! })} />
              )}
            />
          )}
        </View>

        <Pressable style={styles.fab} onPress={() => navigation.navigate("MainTabs", { screen: "AIScan" })}>
          <Ionicons name="add" size={32} color={colors.black} />
        </Pressable>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.black
  },
  hero: {
    paddingTop: spacing.md
  },
  subtitle: {
    marginTop: spacing.sm
  },
  searchShell: {
    marginTop: spacing.xxl,
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: colors.silverSoft,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  searchInput: {
    flex: 1,
    color: colors.ivory,
    fontFamily: fonts.sans,
    fontSize: 18
  },
  filters: {
    marginTop: spacing.xl,
    minHeight: 56
  },
  sortRow: {
    flexDirection: "row",
    marginTop: spacing.sm
  },
  listWrap: {
    flex: 1,
    marginTop: spacing.xl
  },
  columns: {
    justifyContent: "space-between"
  },
  gridContent: {
    paddingBottom: 120
  },
  fab: {
    position: "absolute",
    right: spacing.xl,
    bottom: spacing.xl,
    width: 74,
    height: 74,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
    ...shadows.floating
  }
});

