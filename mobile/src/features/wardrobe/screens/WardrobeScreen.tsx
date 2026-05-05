import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { Chip } from "../../../components/ui/Chip";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Input } from "../../../components/ui/Input";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";
import { Screen } from "../../../components/ui/Screen";
import { WardrobeItemCard } from "../../../components/ui/WardrobeItemCard";
import type { RootStackParamList } from "../../../navigation/types";
import { categories, categoryLabels } from "../../../theme/options";
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
    <Screen scroll={false}>
      <View className="flex-1 pt-3">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-semibold text-mist">Wardrobe</Text>
            <Text className="mt-1 text-sm text-stone">{wardrobe.data?.pagination.total ?? 0} items cataloged</Text>
          </View>
          <Pressable onPress={() => navigation.navigate("AddItem")} className="h-12 w-12 items-center justify-center rounded-full bg-mist">
            <Ionicons name="add" size={24} color="#0b0b0c" />
          </Pressable>
        </View>

        <View className="mt-5">
          <Input placeholder="Search color, tags, notes" value={search} onChangeText={setSearch} />
        </View>

        <View className="mt-4">
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

        <View className="mt-4 flex-row gap-2">
          <Chip label="Newest" selected={sort === "newest"} onPress={() => setSort("newest")} />
          <Chip label="Most used" selected={sort === "most-used"} onPress={() => setSort("most-used")} />
        </View>

        <View className="mt-5 flex-1">
          {wardrobe.isLoading ? <LoadingSkeleton rows={4} /> : null}
          {!wardrobe.isLoading && items.length === 0 ? (
            <EmptyState
              title="No items found"
              body="Add a new item or change your filters."
              actionLabel="Add Item"
              onAction={() => navigation.navigate("AddItem")}
            />
          ) : (
            <FlatList
              data={items}
              numColumns={2}
              keyExtractor={(item) => item.id ?? item._id!}
              columnWrapperStyle={{ justifyContent: "space-between" }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <WardrobeItemCard item={item} onPress={() => navigation.navigate("ClothingDetail", { itemId: item.id ?? item._id! })} />
              )}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}
