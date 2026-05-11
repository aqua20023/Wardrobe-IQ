import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Chip } from "../../../components/ui/Chip";
import { EmptyState } from "../../../components/ui/EmptyState";
import { EditorialCard } from "../../../components/ui/EditorialPrimitives";
import { EditorialText } from "../../../components/ui/EditorialText";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";
import { Screen } from "../../../components/ui/Screen";
import { WardrobeItemCard } from "../../../components/ui/WardrobeItemCard";
import type { RootStackParamList } from "../../../navigation/types";
import { colors, fonts, radii, shadows, spacing } from "../../../theme/editorial";
import { useWardrobe } from "../../wardrobe/hooks/useWardrobe";

const examples = ["black blazer", "rainy work", "ivory knit", "least worn", "silver accessories"];

export function AiSearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [queryText, setQueryText] = useState("");
  const query = useMemo(() => ({ search: queryText || undefined, sort: queryText.includes("least") ? "least-used" as const : "newest" as const }), [queryText]);
  const wardrobe = useWardrobe(query);
  const items = wardrobe.data?.items ?? [];

  return (
    <Screen scroll={false}>
      <EditorialText variant="label" tone="gold" uppercase>
        AI Search
      </EditorialText>
      <EditorialText variant="headline" style={styles.title}>
        Ask the archive.
      </EditorialText>
      <EditorialText variant="bodySmall" tone="ivoryMuted" style={styles.subtitle}>
        Natural-language search is translated into the existing wardrobe list filters without changing API contracts.
      </EditorialText>

      <EditorialCard style={styles.searchCard} elevated>
        <Ionicons name="search-outline" size={24} color={colors.gold} />
        <TextInput
          value={queryText}
          onChangeText={setQueryText}
          placeholder="Find my black blazer for rain..."
          placeholderTextColor={colors.dim}
          style={styles.input}
          returnKeyType="search"
        />
        <Pressable style={styles.mic}>
          <Ionicons name="mic-outline" size={20} color={colors.black} />
        </Pressable>
      </EditorialCard>

      <View style={styles.examples}>
        {examples.map((example) => (
          <Chip key={example} label={example} selected={queryText === example} onPress={() => setQueryText(example)} />
        ))}
      </View>

      <View style={styles.intelligence}>
        <EditorialText variant="label" tone="gold" uppercase>
          Query Read
        </EditorialText>
        <EditorialText variant="bodySmall" tone="ivoryMuted" style={styles.intelligenceCopy}>
          {queryText ? `Searching wardrobe signals for "${queryText}".` : "Enter color, fabric, category, occasion, notes, or tags."}
        </EditorialText>
      </View>

      <View style={styles.results}>
        {wardrobe.isLoading ? <LoadingSkeleton rows={4} /> : null}
        {!wardrobe.isLoading && items.length === 0 ? (
          <EmptyState title="No matching pieces" body="Try another color, occasion, tag, or category." />
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
  searchCard: {
    marginTop: spacing.xxl,
    minHeight: 72,
    paddingHorizontal: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  input: {
    flex: 1,
    minHeight: 58,
    color: colors.ivory,
    fontFamily: fonts.sans,
    fontSize: 17
  },
  mic: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold
  },
  examples: {
    marginTop: spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap"
  },
  intelligence: {
    marginTop: spacing.xl,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    backgroundColor: colors.charcoal,
    padding: spacing.lg,
    ...shadows.soft
  },
  intelligenceCopy: {
    marginTop: spacing.sm
  },
  results: {
    flex: 1,
    marginTop: spacing.xl
  },
  columns: {
    justifyContent: "space-between"
  },
  gridContent: {
    paddingBottom: 120
  }
});

