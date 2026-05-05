import { zodResolver } from "@hookform/resolvers/zod";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";
import { Controller, useForm } from "react-hook-form";
import { Image, Text, View } from "react-native";
import { z } from "zod";
import { getApiErrorMessage } from "../../../api/client";
import { Button } from "../../../components/ui/Button";
import { Chip } from "../../../components/ui/Chip";
import { Input } from "../../../components/ui/Input";
import { Screen } from "../../../components/ui/Screen";
import type { RootStackParamList } from "../../../navigation/types";
import { categories, categoryLabels, occasions, seasons } from "../../../theme/options";
import type { Occasion, Season, WardrobeCategory } from "../../../types/domain";
import { useCreateClothingItem } from "../hooks/useWardrobe";

const schema = z.object({
  imageUri: z.string().optional(),
  category: z.custom<WardrobeCategory>(),
  subcategory: z.string().optional(),
  color: z.string().optional(),
  tagsText: z.string().optional(),
  occasion: z.array(z.custom<Occasion>()).min(1),
  season: z.array(z.custom<Season>()).min(1),
  notes: z.string().optional()
});

type FormValues = z.infer<typeof schema>;
type Props = NativeStackScreenProps<RootStackParamList, "AddItem">;

export function AddItemScreen({ navigation }: Props) {
  const createItem = useCreateClothingItem();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: "tops", occasion: ["casual"], season: ["all-season"], tagsText: "" }
  });

  const imageUri = watch("imageUri");
  const selectedCategory = watch("category");
  const selectedOccasions = watch("occasion");
  const selectedSeasons = watch("season");

  async function pickImage(source: "camera" | "library") {
    const permission =
      source === "camera" ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("root", { message: "Image permission is required to add wardrobe photos." });
      return;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.85, mediaTypes: ImagePicker.MediaTypeOptions.Images })
        : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.85, mediaTypes: ImagePicker.MediaTypeOptions.Images });

    if (!result.canceled) setValue("imageUri", result.assets[0].uri, { shouldValidate: true });
  }

  function toggleValue<T extends string>(values: T[], value: T) {
    return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!values.imageUri) {
      setError("root", { message: "Add a photo before saving this item." });
      return;
    }

    try {
      await createItem.mutateAsync({
        imageUri: values.imageUri,
        category: values.category,
        subcategory: values.subcategory,
        color: values.color,
        tags: values.tagsText?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? [],
        occasion: values.occasion,
        season: values.season,
        notes: values.notes
      });
      navigation.goBack();
    } catch (error) {
      setError("root", { message: getApiErrorMessage(error) });
    }
  });

  return (
    <Screen>
      <View className="gap-5 pt-2">
        <View className="overflow-hidden rounded-lg border border-graphite bg-charcoal">
          {imageUri ? (
            <Image source={{ uri: imageUri }} className="aspect-square w-full" resizeMode="cover" />
          ) : (
            <View className="aspect-square items-center justify-center">
              <Text className="text-base font-semibold text-mist">Add item photo</Text>
              <Text className="mt-2 text-sm text-stone">Gallery or camera</Text>
            </View>
          )}
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button label="Gallery" icon="image-outline" variant="secondary" onPress={() => pickImage("library")} />
          </View>
          <View className="flex-1">
            <Button label="Camera" icon="camera-outline" variant="secondary" onPress={() => pickImage("camera")} />
          </View>
        </View>

        <View>
          <Text className="mb-1 text-sm font-medium text-stone">Category</Text>
          <View className="flex-row flex-wrap">
            {categories.map((category) => (
              <Chip key={category} label={categoryLabels[category]} selected={selectedCategory === category} onPress={() => setValue("category", category)} />
            ))}
          </View>
        </View>

        <Controller control={control} name="subcategory" render={({ field: { onChange, value } }) => <Input label="Subcategory" placeholder="Oxford shirt, denim, loafers" value={value} onChangeText={onChange} />} />
        <Controller control={control} name="color" render={({ field: { onChange, value } }) => <Input label="Color" placeholder="Black, ivory, navy" value={value} onChangeText={onChange} />} />
        <Controller control={control} name="tagsText" render={({ field: { onChange, value } }) => <Input label="Tags" placeholder="favorite, linen, minimal" value={value} onChangeText={onChange} />} />

        <View>
          <Text className="mb-1 text-sm font-medium text-stone">Occasion</Text>
          <View className="flex-row flex-wrap">
            {occasions.map((occasion) => (
              <Chip key={occasion} label={occasion} selected={selectedOccasions.includes(occasion)} onPress={() => setValue("occasion", toggleValue(selectedOccasions, occasion))} />
            ))}
          </View>
          {errors.occasion?.message ? <Text className="mt-2 text-sm text-oxblood">{errors.occasion.message}</Text> : null}
        </View>

        <View>
          <Text className="mb-1 text-sm font-medium text-stone">Season</Text>
          <View className="flex-row flex-wrap">
            {seasons.map((season) => (
              <Chip key={season} label={season} selected={selectedSeasons.includes(season)} onPress={() => setValue("season", toggleValue(selectedSeasons, season))} />
            ))}
          </View>
        </View>

        <Controller control={control} name="notes" render={({ field: { onChange, value } }) => <Input label="Notes" multiline placeholder="Fit, fabric, styling notes" value={value} onChangeText={onChange} className="min-h-[96px] pt-4" />} />

        {errors.root?.message ? <Text className="text-sm text-oxblood">{errors.root.message}</Text> : null}
        <Button label="Save Item" loading={isSubmitting || createItem.isPending} onPress={onSubmit} icon="checkmark" />
      </View>
    </Screen>
  );
}
