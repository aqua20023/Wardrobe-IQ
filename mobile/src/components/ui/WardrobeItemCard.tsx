import { Image, Pressable, Text, View } from "react-native";
import type { ClothingItem } from "../../types/domain";

type WardrobeItemCardProps = {
  item: ClothingItem;
  onPress?: () => void;
  selected?: boolean;
};

export function WardrobeItemCard({ item, onPress, selected }: WardrobeItemCardProps) {
  return (
    <Pressable onPress={onPress} className="mb-4 w-[48%]">
      <View className={`overflow-hidden rounded-lg border ${selected ? "border-brass" : "border-graphite"} bg-charcoal`}>
        <Image source={{ uri: item.imageUrl }} className="aspect-[4/5] w-full bg-graphite" resizeMode="cover" />
        <View className="p-3">
          <Text className="text-sm font-semibold capitalize text-mist" numberOfLines={1}>
            {item.subcategory || item.category}
          </Text>
          <Text className="mt-1 text-xs capitalize text-stone" numberOfLines={1}>
            {[item.color, item.occasion?.[0]].filter(Boolean).join(" / ")}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
