import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Alert, Image, Pressable, StyleSheet, View } from "react-native";
import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../api/client";
import { Button } from "../../../components/ui/Button";
import { Chip } from "../../../components/ui/Chip";
import { EmptyState } from "../../../components/ui/EmptyState";
import { EditorialCard, PaletteDots, ProgressBar } from "../../../components/ui/EditorialPrimitives";
import { EditorialText } from "../../../components/ui/EditorialText";
import { Input } from "../../../components/ui/Input";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";
import { Screen } from "../../../components/ui/Screen";
import type { RootStackParamList } from "../../../navigation/types";
import { categoryLabels } from "../../../theme/options";
import { colors, radii, shadows, spacing } from "../../../theme/editorial";
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

  const confidence = item.aiMetadata?.confidence ? Math.round(item.aiMetadata.confidence * 100) : undefined;
  const palette = [resolveColor(item.color), colors.espressoSoft, colors.ivoryMuted];

  return (
    <Screen>
      <View style={styles.imageShell}>
        <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
        {confidence ? (
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles-outline" size={14} color={colors.gold} />
            <EditorialText variant="caption">{confidence}% AI</EditorialText>
          </View>
        ) : null}
      </View>

      <View style={styles.titleRow}>
        <View style={{ flex: 1 }}>
          <EditorialText variant="label" tone="gold" uppercase>
            {categoryLabels[item.category]}
          </EditorialText>
          <EditorialText variant="headline" style={styles.title}>
            {item.subcategory || item.category}
          </EditorialText>
        </View>
        <Pressable onPress={() => setEditing((value) => !value)} style={styles.editButton}>
          <Ionicons name={editing ? "close" : "create-outline"} size={20} color={colors.ivory} />
        </Pressable>
      </View>

      {editing ? (
        <EditorialCard style={styles.editPanel}>
          <Input label="Color" value={color} onChangeText={setColor} />
          <Input label="Tags" value={tagsText} onChangeText={setTagsText} />
          <Input label="Notes" multiline value={notes} onChangeText={setNotes} />
          {error ? (
            <EditorialText variant="caption" tone="oxblood">
              {error}
            </EditorialText>
          ) : null}
          <Button label="Save Changes" loading={updateItem.isPending} onPress={saveEdits} />
        </EditorialCard>
      ) : (
        <View style={styles.body}>
          <EditorialCard style={styles.intelligence}>
            <View style={styles.intelligenceTop}>
              <View>
                <EditorialText variant="label" tone="stone" uppercase>
                  Color Read
                </EditorialText>
                <PaletteDots colors={palette} />
              </View>
              <View style={{ flex: 1 }}>
                <ProgressBar value={confidence ?? 86} label="Archive Confidence" detail="Metadata preserved for future outfit ranking." />
              </View>
            </View>
          </EditorialCard>

          <View style={styles.tags}>
            {[item.color, ...item.occasion, ...item.season, ...item.tags]
              .filter((label): label is string => Boolean(label))
              .map((label, index) => (
                <Chip key={`${label}-${index}`} label={label} selected compact />
              ))}
          </View>

          <EditorialCard style={styles.usage}>
            <EditorialText variant="label" tone="stone" uppercase>
              Usage
            </EditorialText>
            <EditorialText variant="headlineSmall" style={styles.usageValue}>
              {item.usageCount} wears
            </EditorialText>
            <EditorialText variant="bodySmall" tone="stone">
              {item.lastWorn ? `Last worn ${new Date(item.lastWorn).toLocaleDateString()}` : "Not marked worn yet"}
            </EditorialText>
          </EditorialCard>

          {item.notes ? (
            <EditorialCard style={styles.note}>
              <EditorialText variant="body" tone="ivoryMuted">
                {item.notes}
              </EditorialText>
            </EditorialCard>
          ) : null}
        </View>
      )}

      <View style={styles.actions}>
        <Button label="Add to Outfit" icon="layers-outline" onPress={() => navigation.navigate("OutfitBuilder", { initialItemId: itemId })} />
        <Button label="Delete Item" variant="danger" icon="trash-outline" loading={deleteItem.isPending} onPress={confirmDelete} />
      </View>
    </Screen>
  );
}

function resolveColor(value?: string) {
  if (!value) return colors.graphite;
  if (value.startsWith("#") || value.startsWith("rgb")) return value;
  const key = value.toLowerCase();
  if (key.includes("black")) return "#050505";
  if (key.includes("white") || key.includes("ivory") || key.includes("cream")) return "#eee9dc";
  if (key.includes("brown") || key.includes("espresso")) return colors.espressoSoft;
  if (key.includes("blue") || key.includes("navy")) return "#1b2632";
  if (key.includes("grey") || key.includes("gray")) return "#656764";
  if (key.includes("green") || key.includes("olive")) return "#4d5543";
  if (key.includes("red") || key.includes("burgundy")) return "#6d2635";
  if (key.includes("gold") || key.includes("beige") || key.includes("tan")) return colors.beige;
  return colors.graphite;
}

const styles = StyleSheet.create({
  imageShell: {
    aspectRatio: 0.82,
    borderRadius: radii.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.charcoal,
    ...shadows.floating
  },
  image: {
    width: "100%",
    height: "100%"
  },
  aiBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    backgroundColor: "rgba(11,11,10,0.76)",
    paddingHorizontal: 10,
    paddingVertical: 7
  },
  titleRow: {
    marginTop: spacing.xxl,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.lg
  },
  title: {
    marginTop: spacing.sm,
    textTransform: "capitalize"
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.charcoal,
    alignItems: "center",
    justifyContent: "center"
  },
  editPanel: {
    marginTop: spacing.xl,
    padding: spacing.xl,
    gap: spacing.lg
  },
  body: {
    marginTop: spacing.xl,
    gap: spacing.lg
  },
  intelligence: {
    padding: spacing.xl
  },
  intelligenceTop: {
    flexDirection: "row",
    gap: spacing.xl,
    alignItems: "center"
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  usage: {
    padding: spacing.xl
  },
  usageValue: {
    marginTop: spacing.sm
  },
  note: {
    padding: spacing.xl
  },
  actions: {
    marginTop: spacing.xxl,
    gap: spacing.md
  }
});

