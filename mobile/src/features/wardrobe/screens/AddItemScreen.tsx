import { zodResolver } from "@hookform/resolvers/zod";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { Controller, useForm } from "react-hook-form";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { z } from "zod";
import { getApiErrorMessage } from "../../../api/client";
import { Button } from "../../../components/ui/Button";
import { Chip } from "../../../components/ui/Chip";
import { Input } from "../../../components/ui/Input";
import { Screen } from "../../../components/ui/Screen";
import type { RootStackParamList } from "../../../navigation/types";
import { categories, categoryLabels, occasions, seasons } from "../../../theme/options";
import type { Occasion, Season, WardrobeCategory } from "../../../types/domain";
import { useCreateClothingItem, usePredictClothingItem } from "../hooks/useWardrobe";

const schema = z.object({
  imageUri: z.string().optional(),
  // imageUrl/publicId come back from the predict step — avoids a double upload
  imageUrl: z.string().optional(),
  imagePublicId: z.string().optional(),
  category: z.custom<WardrobeCategory>(),
  subcategory: z.string().optional(),
  color: z.string().optional(),
  tagsText: z.string().optional(),
  occasion: z.array(z.custom<Occasion>()).min(1),
  season: z.array(z.custom<Season>()).min(1),
  notes: z.string().optional(),
  // Hidden AI hint fields for correction tracking
  predictedCategory: z.custom<WardrobeCategory | "unknown">().optional(),
  confidence: z.number().optional()
});

type FormValues = z.infer<typeof schema>;
type Props = NativeStackScreenProps<RootStackParamList, "AddItem">;

export function AddItemScreen({ navigation }: Props) {
  const createItem = useCreateClothingItem();
  const predictItem = usePredictClothingItem();

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
  const imageUrl = watch("imageUrl");
  const selectedCategory = watch("category");
  const selectedOccasions = watch("occasion");
  const selectedSeasons = watch("season");
  const predictedCategory = watch("predictedCategory");
  const confidence = watch("confidence");

  // Has the user overridden the AI suggestion?
  const isAiCorrected =
    predictedCategory !== undefined &&
    predictedCategory !== "unknown" &&
    predictedCategory !== selectedCategory;

  async function pickImage(source: "camera" | "library") {
    const permission =
      source === "camera"
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError("root", { message: "Image permission is required to add wardrobe photos." });
      return;
    }

    const result =
      source === "camera"
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.85, mediaTypes: "images" })
        : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.85, mediaTypes: "images" });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setValue("imageUri", uri, { shouldValidate: true });

    // Clear any previous prediction state
    setValue("imageUrl", undefined);
    setValue("imagePublicId", undefined);
    setValue("predictedCategory", undefined);
    setValue("confidence", undefined);

    // Fire prediction — uploads to Cloudinary + AI in one step
    try {
      const prediction = await predictItem.mutateAsync(uri);
      setValue("imageUrl", prediction.imageUrl);
      setValue("imagePublicId", prediction.imagePublicId);
      setValue("confidence", prediction.confidence);

      if (prediction.predictedCategory !== "unknown") {
        setValue("predictedCategory", prediction.predictedCategory);
        setValue("category", prediction.predictedCategory as WardrobeCategory);
      }
    } catch {
      // Non-fatal — user can still fill the form manually
    }
  }

  function toggleValue<T extends string>(values: T[], value: T) {
    return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!values.imageUri && !values.imageUrl) {
      setError("root", { message: "Add a photo before saving this item." });
      return;
    }

    try {
      await createItem.mutateAsync({
        // If we already have a Cloudinary URL from the predict step, skip re-uploading
        imageUri: values.imageUrl ? undefined : values.imageUri,
        imageUrl: values.imageUrl,
        imagePublicId: values.imagePublicId,
        category: values.category,
        subcategory: values.subcategory,
        color: values.color,
        tags: values.tagsText?.split(",").map((t) => t.trim()).filter(Boolean) ?? [],
        occasion: values.occasion,
        season: values.season,
        notes: values.notes,
        // Echo AI hint so the backend can detect corrections
        predictedCategory: values.predictedCategory,
        confidence: values.confidence
      });
      navigation.goBack();
    } catch (error) {
      setError("root", { message: getApiErrorMessage(error) });
    }
  });

  const isPredicting = predictItem.isPending;

  return (
    <Screen>
      <View className="gap-5 pt-2">
        {/* ── Image Preview ── */}
        <View className="overflow-hidden rounded-lg border border-graphite bg-charcoal">
          {imageUri ? (
            <View>
              <Image source={{ uri: imageUri }} className="aspect-square w-full" resizeMode="cover" />
              {/* Prediction overlay while uploading */}
              {isPredicting && (
                <View className="absolute inset-0 items-center justify-center bg-ink/60">
                  <ActivityIndicator color="#f4f4f1" size="large" />
                  <Text className="mt-3 text-sm font-medium text-mist">Analysing outfit…</Text>
                </View>
              )}
            </View>
          ) : (
            <View className="aspect-square items-center justify-center">
              <Ionicons name="shirt-outline" size={40} color="#8f8a82" />
              <Text className="mt-3 text-base font-semibold text-mist">Add item photo</Text>
              <Text className="mt-1 text-sm text-stone">Gallery or camera</Text>
            </View>
          )}
        </View>

        {/* ── AI Prediction Badge ── */}
        {!isPredicting && predictedCategory && predictedCategory !== "unknown" && (
          <View
            className={`flex-row items-center gap-2 rounded-lg border px-4 py-3 ${
              isAiCorrected ? "border-brass/40 bg-brass/10" : "border-graphite bg-charcoal"
            }`}
          >
            <Ionicons
              name={isAiCorrected ? "create-outline" : "sparkles-outline"}
              size={16}
              color={isAiCorrected ? "#b59b68" : "#f4f4f1"}
            />
            <Text className={`flex-1 text-sm font-medium ${isAiCorrected ? "text-brass" : "text-mist"}`}>
              {isAiCorrected
                ? `AI suggested "${categoryLabels[predictedCategory as WardrobeCategory]}" · You changed it`
                : `Predicted: ${categoryLabels[predictedCategory as WardrobeCategory]} (${Math.round((confidence ?? 0) * 100)}%)`}
            </Text>
            {isAiCorrected && (
              <Pressable
                onPress={() => {
                  setValue("category", predictedCategory as WardrobeCategory);
                }}
                hitSlop={8}
              >
                <Text className="text-xs text-brass underline">Revert</Text>
              </Pressable>
            )}
          </View>
        )}

        {/* ── Image Source Buttons ── */}
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button label="Gallery" icon="image-outline" variant="secondary" onPress={() => pickImage("library")} disabled={isPredicting} />
          </View>
          <View className="flex-1">
            <Button label="Camera" icon="camera-outline" variant="secondary" onPress={() => pickImage("camera")} disabled={isPredicting} />
          </View>
        </View>

        {/* ── Category ── */}
        <View>
          <Text className="mb-1 text-sm font-medium text-stone">Category</Text>
          <View className="flex-row flex-wrap">
            {categories.map((category) => (
              <Chip
                key={category}
                label={categoryLabels[category]}
                selected={selectedCategory === category}
                onPress={() => setValue("category", category)}
              />
            ))}
          </View>
        </View>

        <Controller control={control} name="subcategory" render={({ field: { onChange, value } }) => <Input label="Subcategory" placeholder="Oxford shirt, denim, loafers" value={value} onChangeText={onChange} />} />
        <Controller control={control} name="color" render={({ field: { onChange, value } }) => <Input label="Color" placeholder="Black, ivory, navy" value={value} onChangeText={onChange} />} />
        <Controller control={control} name="tagsText" render={({ field: { onChange, value } }) => <Input label="Tags" placeholder="favorite, linen, minimal" value={value} onChangeText={onChange} />} />

        {/* ── Occasion ── */}
        <View>
          <Text className="mb-1 text-sm font-medium text-stone">Occasion</Text>
          <View className="flex-row flex-wrap">
            {occasions.map((occasion) => (
              <Chip key={occasion} label={occasion} selected={selectedOccasions.includes(occasion)} onPress={() => setValue("occasion", toggleValue(selectedOccasions, occasion))} />
            ))}
          </View>
          {errors.occasion?.message ? <Text className="mt-2 text-sm text-oxblood">{errors.occasion.message}</Text> : null}
        </View>

        {/* ── Season ── */}
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

        <Button
          label="Save Item"
          loading={isSubmitting || createItem.isPending || isPredicting}
          onPress={onSubmit}
          icon="checkmark"
        />
      </View>
    </Screen>
  );
}
