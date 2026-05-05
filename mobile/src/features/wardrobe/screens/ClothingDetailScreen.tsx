import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, Image, Pressable, Text, View } from "react-native";
import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../api/client";
import { Button } from "../../../components/ui/Button";
import { Chip } from "../../../components/ui/Chip";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Input } from "../../../components/ui/Input";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";
import { Screen } from "../../../components/ui/Screen";
import type { RootStackParamList } from "../../../navigation/types";
import { categoryLabels } from "../../../theme/options";
import { useClothingItem, useDeleteClothingItem, useUpdateClothingItem } from "../hooks/useWardrobe";

type Props = NativeStackScreenProps<RootStackParamList, "ClothingDetail">;

export function ClothingDetailScreen({ route, navigation }: Props) {
  const { itemId } = route.params;
  const itemQuery = useClothingItem(itemId);
  const deleteItem = useDeleteClothingItem();
  const updateItem = useUpdateClothingItem();
  const item = itemQuery.data;
  const [editing, setEditing] = useState(false);
  const [color, setColor] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!item) return;
    setColor(item.color ?? "");
    setTagsText(item.tags.join(", "));
    setNotes(item.notes ?? "");
  }, [item]);

  function confirmDelete() {
    Alert.alert("Delete item", "Remove this wardrobe item permanently?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteItem.mutateAsync(itemId);
          navigation.goBack();
        }
      }
    ]);
  }

  async function saveEdits() {
    if (!item) return;
    try {
      setError(null);
      await updateItem.mutateAsync({
        id: itemId,
        input: {
          imageUrl: item.imageUrl,
          category: item.category,
          subcategory: item.subcategory,
          color,
          tags: tagsText.split(",").map((tag) => tag.trim()).filter(Boolean),
          occasion: item.occasion,
          season: item.season,
          notes
        }
      });
      setEditing(false);
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  if (itemQuery.isLoading) {
    return (
      <Screen>
        <LoadingSkeleton rows={4} />
      </Screen>
    );
  }

  if (!item) {
    return (
      <Screen>
        <EmptyState title="Item not found" body="This item may have been deleted." />
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="overflow-hidden rounded-lg border border-graphite bg-charcoal">
        <Image source={{ uri: item.imageUrl }} className="aspect-[4/5] w-full" resizeMode="cover" />
      </View>

      <View className="mt-5 flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-3xl font-semibold capitalize text-mist">{item.subcategory || item.category}</Text>
          <Text className="mt-2 text-base capitalize text-stone">{categoryLabels[item.category]}</Text>
        </View>
        <Pressable onPress={() => setEditing((value) => !value)} className="h-11 w-11 items-center justify-center rounded-full bg-charcoal">
          <Ionicons name={editing ? "close" : "create-outline"} size={20} color="#f4f4f1" />
        </Pressable>
      </View>

      {editing ? (
        <View className="mt-5 gap-4">
          <Input label="Color" value={color} onChangeText={setColor} />
          <Input label="Tags" value={tagsText} onChangeText={setTagsText} />
          <Input label="Notes" multiline value={notes} onChangeText={setNotes} className="min-h-[96px] pt-4" />
          {error ? <Text className="text-sm text-oxblood">{error}</Text> : null}
          <Button label="Save Changes" loading={updateItem.isPending} onPress={saveEdits} />
        </View>
      ) : (
        <View className="mt-5 gap-4">
          <View className="flex-row flex-wrap">
            {[item.color, ...item.occasion, ...item.season, ...item.tags]
              .filter((label): label is string => Boolean(label))
              .map((label, index) => (
              <Chip key={`${label}-${index}`} label={label} selected />
              ))}
          </View>
          <View className="rounded-lg border border-graphite bg-charcoal p-4">
            <Text className="text-xs uppercase text-stone">Usage</Text>
            <Text className="mt-2 text-2xl font-semibold text-mist">{item.usageCount} wears</Text>
            <Text className="mt-1 text-sm text-stone">{item.lastWorn ? `Last worn ${new Date(item.lastWorn).toLocaleDateString()}` : "Not marked worn yet"}</Text>
          </View>
          {item.notes ? <Text className="text-base leading-6 text-stone">{item.notes}</Text> : null}
        </View>
      )}

      <View className="mt-6 gap-3">
        <Button label="Add to Outfit" icon="layers-outline" onPress={() => navigation.navigate("OutfitBuilder", { initialItemId: itemId })} />
        <Button label="Delete Item" variant="danger" icon="trash-outline" loading={deleteItem.isPending} onPress={confirmDelete} />
      </View>
    </Screen>
  );
}
