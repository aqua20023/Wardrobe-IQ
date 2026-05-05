import { Ionicons } from "@expo/vector-icons";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { Pressable, Text, View } from "react-native";
import { analyticsApi } from "../../../api/analytics";
import { wardrobeApi } from "../../../api/wardrobe";
import { EmptyState } from "../../../components/ui/EmptyState";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";
import { Screen } from "../../../components/ui/Screen";
import { StatCard } from "../../../components/ui/StatCard";
import { WardrobeItemCard } from "../../../components/ui/WardrobeItemCard";
import type { RootStackParamList } from "../../../navigation/types";
import { useAuthStore } from "../../../stores/authStore";

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useAuthStore((state) => state.user);
  const stats = useQuery({ queryKey: ["analytics", "wardrobe"], queryFn: analyticsApi.wardrobe });
  const recent = useQuery({ queryKey: ["wardrobe", "recent"], queryFn: () => wardrobeApi.list({ sort: "newest" }) });

  return (
    <Screen>
      <View className="pt-4">
        <Text className="text-sm uppercase text-brass">Wardrobe IQ</Text>
        <Text className="mt-2 text-3xl font-semibold text-mist">Hi, {user?.name?.split(" ")[0] ?? "there"}</Text>
        <Text className="mt-2 text-base leading-6 text-stone">Your closet is ready for today’s choices.</Text>
      </View>

      <View className="mt-6 flex-row gap-3">
        <StatCard label="Items" value={stats.data?.itemCount ?? 0} icon="shirt-outline" />
        <StatCard label="Outfits" value={stats.data?.outfitCount ?? 0} icon="albums-outline" />
        <StatCard label="Saved" value={stats.data?.savedOutfitCount ?? 0} icon="bookmark-outline" />
      </View>

      <View className="mt-6 rounded-lg border border-graphite bg-charcoal p-5">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-semibold text-mist">Today’s Outfit</Text>
            <Text className="mt-1 text-sm text-stone">AI-ready placeholder</Text>
          </View>
          <View className="h-11 w-11 items-center justify-center rounded-full bg-ink">
            <Ionicons name="sparkles-outline" color="#b59b68" size={20} />
          </View>
        </View>
        <Text className="mt-4 text-sm leading-5 text-stone">
          Recommendation logic is intentionally rule-based in Phase 1. Your wardrobe data is being shaped for future ranking.
        </Text>
      </View>

      <View className="mt-6 flex-row gap-3">
        <Pressable onPress={() => navigation.navigate("AddItem")} className="flex-1 rounded-lg bg-mist p-4">
          <Ionicons name="camera-outline" size={20} color="#0b0b0c" />
          <Text className="mt-3 font-semibold text-ink">Add Item</Text>
        </Pressable>
        <Pressable onPress={() => navigation.navigate("OutfitBuilder", {})} className="flex-1 rounded-lg border border-graphite bg-charcoal p-4">
          <Ionicons name="layers-outline" size={20} color="#f4f4f1" />
          <Text className="mt-3 font-semibold text-mist">Build Outfit</Text>
        </Pressable>
      </View>

      <View className="mt-8">
        <Text className="mb-4 text-xl font-semibold text-mist">Recent items</Text>
        {recent.isLoading ? <LoadingSkeleton /> : null}
        {!recent.isLoading && !recent.data?.items.length ? (
          <EmptyState title="No wardrobe items yet" body="Add your first piece to unlock outfit building." actionLabel="Add Item" onAction={() => navigation.navigate("AddItem")} />
        ) : (
          <View className="flex-row flex-wrap justify-between">
            {recent.data?.items.slice(0, 4).map((item) => (
              <WardrobeItemCard key={item.id ?? item._id} item={item} onPress={() => navigation.navigate("ClothingDetail", { itemId: item.id ?? item._id! })} />
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}
