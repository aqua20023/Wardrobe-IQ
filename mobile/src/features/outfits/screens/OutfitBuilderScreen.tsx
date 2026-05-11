import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { getApiErrorMessage } from "../../../api/client";
import { Button } from "../../../components/ui/Button";
import { Chip } from "../../../components/ui/Chip";
import { EmptyState } from "../../../components/ui/EmptyState";
import { EditorialCard, SectionHeader } from "../../../components/ui/EditorialPrimitives";
import { EditorialText } from "../../../components/ui/EditorialText";
import { Input } from "../../../components/ui/Input";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";
import { Screen } from "../../../components/ui/Screen";
import { WardrobeItemCard } from "../../../components/ui/WardrobeItemCard";
import type { RootStackParamList } from "../../../navigation/types";
import { occasions } from "../../../theme/options";
import { colors, spacing } from "../../../theme/editorial";
import type { Occasion } from "../../../types/domain";
import { useWardrobe } from "../../wardrobe/hooks/useWardrobe";
import { useCreateOutfit } from "../hooks/useOutfits";

type Props = NativeStackScreenProps<RootStackParamList, "OutfitBuilder">;

export function OutfitBuilderScreen({ route, navigation }: Props) {
  const initialItemId = route.params?.initialItemId;
  const wardrobe = useWardrobe({ sort: "newest" });
  const createOutfit = useCreateOutfit();
  const [selectedIds, setSelectedIds] = useState<string[]>(initialItemId ? [initialItemId] : []);
  const [title, setTitle] = useState("");
  const [occasion, setOccasion] = useState<Occasion>("casual");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedItems = useMemo(
    () => wardrobe.data?.items.filter((item) => selectedIds.includes(item.id ?? item._id!)) ?? [],
    [wardrobe.data?.items, selectedIds]
  );

  function toggle(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((itemId) => itemId !== id) : [...current, id]));
  }

  async function save() {
    if (!title.trim()) {
      setError("Give this outfit a title.");
      return;
    }
    if (!selectedIds.length) {
      setError("Select at least one wardrobe item.");
      return;
    }

    try {
      setError(null);
      await createOutfit.mutateAsync({ title: title.trim(), itemIds: selectedIds, occasion, notes, saved: true });
      navigation.goBack();
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  }

  return (
    <Screen>
      <EditorialText variant="label" tone="gold" uppercase>
        Manual Curation
      </EditorialText>
      <EditorialText variant="headline" style={styles.title}>
        Build an outfit.
      </EditorialText>
      <EditorialText variant="bodySmall" tone="ivoryMuted" style={styles.subtitle}>
        Select pieces manually and save the combination with the same outfit API contract.
      </EditorialText>

      <EditorialCard style={styles.form}>
        <Input label="Outfit title" value={title} onChangeText={setTitle} placeholder="Monday office, dinner uniform" />
        <View>
          <EditorialText variant="caption" tone="stone" uppercase>
            Occasion
          </EditorialText>
          <View style={styles.wrap}>
            {occasions.map((value) => (
              <Chip key={value} label={value} selected={occasion === value} onPress={() => setOccasion(value)} />
            ))}
          </View>
        </View>
        <Input label="Notes" value={notes} onChangeText={setNotes} multiline placeholder="Why this works, fit details, styling reminders" />
      </EditorialCard>

      <View style={styles.section}>
        <SectionHeader title={`Selected Pieces (${selectedItems.length})`} />
        {wardrobe.isLoading ? <LoadingSkeleton rows={3} /> : null}
        {!wardrobe.isLoading && !wardrobe.data?.items.length ? (
          <EmptyState title="No wardrobe items" body="Add clothing items before building outfits." />
        ) : (
          <View style={styles.grid}>
            {wardrobe.data?.items.map((item) => {
              const id = item.id ?? item._id!;
              return <WardrobeItemCard key={id} item={item} selected={selectedIds.includes(id)} onPress={() => toggle(id)} />;
            })}
          </View>
        )}
      </View>

      {error ? (
        <EditorialText variant="caption" tone="oxblood" style={styles.error}>
          {error}
        </EditorialText>
      ) : null}
      <View style={styles.action}>
        <Button label="Save Outfit" loading={createOutfit.isPending} onPress={save} icon="bookmark-outline" />
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
  form: {
    marginTop: spacing.xxl,
    padding: spacing.xl,
    gap: spacing.lg
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.sm
  },
  section: {
    marginTop: spacing.section
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  error: {
    marginTop: spacing.lg
  },
  action: {
    marginTop: spacing.xl
  }
});

