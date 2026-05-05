import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { Text, View } from "react-native";
import { EmptyState } from "../../../components/ui/EmptyState";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";
import { OutfitCard } from "../../../components/ui/OutfitCard";
import { Screen } from "../../../components/ui/Screen";
import { WardrobeItemCard } from "../../../components/ui/WardrobeItemCard";
import type { RootStackParamList } from "../../../navigation/types";
import { useWardrobe } from "../../wardrobe/hooks/useWardrobe";
import { useOutfits } from "../hooks/useOutfits";

export function FavoritesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const savedOutfits = useOutfits({ saved: true });
  const favoriteItems = useWardrobe({ search: "favorite" });

  return (
    <Screen>
      <Text className="text-3xl font-semibold text-mist">Favorites</Text>
      <Text className="mt-2 text-base leading-6 text-stone">Saved outfits and items tagged as favorite.</Text>

      <View className="mt-7">
        <Text className="mb-4 text-xl font-semibold text-mist">Saved outfits</Text>
        {savedOutfits.isLoading ? <LoadingSkeleton rows={2} /> : null}
        {!savedOutfits.isLoading && !savedOutfits.data?.outfits.length ? (
          <EmptyState title="No saved outfits" body="Save suggestions or build outfits to see them here." />
        ) : (
          <View className="gap-4">
            {savedOutfits.data?.outfits.map((outfit) => (
              <OutfitCard key={outfit.id ?? outfit._id} outfit={outfit} />
            ))}
          </View>
        )}
      </View>

      <View className="mt-8">
        <Text className="mb-4 text-xl font-semibold text-mist">Favorite items</Text>
        {favoriteItems.isLoading ? <LoadingSkeleton rows={2} /> : null}
        {!favoriteItems.isLoading && !favoriteItems.data?.items.length ? (
          <EmptyState title="No favorite items" body='Add the tag "favorite" to items you reach for often.' />
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {favoriteItems.data?.items.map((item) => (
              <WardrobeItemCard key={item.id ?? item._id} item={item} onPress={() => navigation.navigate("ClothingDetail", { itemId: item.id ?? item._id! })} />
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}
