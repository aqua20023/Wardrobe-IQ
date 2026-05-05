import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, Text, View } from "react-native";
import type { ClothingItem, Outfit, OutfitSuggestion } from "../../types/domain";

type OutfitLike = Outfit | OutfitSuggestion;

function getItems(outfit: OutfitLike): ClothingItem[] {
  if ("items" in outfit) return outfit.items;
  return outfit.itemIds.filter((item): item is ClothingItem => typeof item !== "string");
}

type OutfitCardProps = {
  outfit: OutfitLike;
  onPress?: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  onSave?: () => void;
};

export function OutfitCard({ outfit, onPress, onLike, onDislike, onSave }: OutfitCardProps) {
  const items = getItems(outfit).slice(0, 4);

  return (
    <Pressable onPress={onPress} className="rounded-lg border border-graphite bg-charcoal p-4">
      <View className="flex-row gap-2">
        {items.map((item) => (
          <Image key={item.id ?? item._id} source={{ uri: item.imageUrl }} className="h-20 flex-1 rounded-md bg-graphite" resizeMode="cover" />
        ))}
      </View>
      <Text className="mt-4 text-lg font-semibold text-mist">{outfit.title}</Text>
      <Text className="mt-1 text-sm capitalize text-stone">{outfit.occasion}</Text>
      {"reason" in outfit ? <Text className="mt-3 text-sm leading-5 text-stone">{outfit.reason}</Text> : null}
      <View className="mt-4 flex-row gap-3">
        <Pressable onPress={onLike} className="h-10 w-10 items-center justify-center rounded-full bg-ink">
          <Ionicons name="thumbs-up-outline" size={18} color="#f4f4f1" />
        </Pressable>
        <Pressable onPress={onDislike} className="h-10 w-10 items-center justify-center rounded-full bg-ink">
          <Ionicons name="thumbs-down-outline" size={18} color="#f4f4f1" />
        </Pressable>
        <Pressable onPress={onSave} className="h-10 w-10 items-center justify-center rounded-full bg-ink">
          <Ionicons name={outfit.saved ? "bookmark" : "bookmark-outline"} size={18} color="#f4f4f1" />
        </Pressable>
      </View>
    </Pressable>
  );
}
