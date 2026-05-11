import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { CommonActions, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Animated, Image, Pressable, StyleSheet, View } from "react-native";
import { z } from "zod";
import { getApiErrorMessage } from "../../../api/client";
import { Button } from "../../../components/ui/Button";
import { Chip } from "../../../components/ui/Chip";
import { EditorialCard, PaletteDots, ProgressBar } from "../../../components/ui/EditorialPrimitives";
import { EditorialText } from "../../../components/ui/EditorialText";
import { Input } from "../../../components/ui/Input";
import { Screen } from "../../../components/ui/Screen";
import { categories, categoryLabels, occasions, seasons } from "../../../theme/options";
import { colors, radii, shadows, spacing } from "../../../theme/editorial";
import type { Occasion, Season, WardrobeCategory } from "../../../types/domain";
import { useCreateClothingItem, usePredictClothingItem } from "../hooks/useWardrobe";

const schema = z.object({
  imageUri: z.string().optional(),
  imageUrl: z.string().optional(),
  imagePublicId: z.string().optional(),
  category: z.custom<WardrobeCategory>(),
  subcategory: z.string().optional(),
  color: z.string().optional(),
  tagsText: z.string().optional(),
  occasion: z.array(z.custom<Occasion>()).min(1),
  season: z.array(z.custom<Season>()).min(1),
  notes: z.string().optional(),
  predictedCategory: z.custom<WardrobeCategory | "unknown">().optional(),
  confidence: z.number().optional()
});

type FormValues = z.infer<typeof schema>;

export function AddItemScreen() {
  const navigation = useNavigation();
  const createItem = useCreateClothingItem();
  const predictItem = usePredictClothingItem();
  const scan = useRef(new Animated.Value(0)).current;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { category: "tops", occasion: ["casual"], season: ["all-season"], tagsText: "" }
  });

  const imageUri = watch("imageUri");
  const selectedCategory = watch("category");
  const selectedOccasions = watch("occasion");
  const selectedSeasons = watch("season");
  const predictedCategory = watch("predictedCategory");
  const confidence = watch("confidence");
  const primaryColor = watch("color");
  const subcategory = watch("subcategory");

  const [secondaryColors, setSecondaryColors] = useState<string[]>([]);

  useEffect(() => {
    if (!predictItem.isPending) return;
    scan.setValue(0);
    const loop = Animated.loop(
      Animated.timing(scan, {
        toValue: 1,
        duration: 1600,
        useNativeDriver: true
      })
    );
    loop.start();
    return () => loop.stop();
  }, [predictItem.isPending, scan]);

  const palette = useMemo(() => {
    const values = [primaryColor, ...secondaryColors].filter(Boolean).map((value) => resolveColor(value));
    return values.length ? values.slice(0, 4) : [colors.beige, colors.graphite, colors.ivoryMuted];
  }, [primaryColor, secondaryColors]);

  const tags = useMemo(() => buildTags(selectedCategory, subcategory, primaryColor, selectedSeasons), [selectedCategory, subcategory, primaryColor, selectedSeasons]);
  const fabric = inferFabric(selectedCategory, subcategory);
  const isPredicting = predictItem.isPending;
  const hasAnalysis = Boolean(predictedCategory && predictedCategory !== "unknown" && confidence !== undefined);
  const scanTranslate = scan.interpolate({ inputRange: [0, 1], outputRange: [-260, 260] });

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
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.88, mediaTypes: "images" })
        : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.88, mediaTypes: "images" });

    if (result.canceled) return;

    const uri = result.assets[0].uri;
    setValue("imageUri", uri, { shouldValidate: true });
    clearErrors("root");
    setValue("imageUrl", undefined);
    setValue("imagePublicId", undefined);
    setValue("predictedCategory", undefined);
    setValue("confidence", undefined);
    setSecondaryColors([]);

    try {
      const prediction = await predictItem.mutateAsync(uri);
      setValue("imageUrl", prediction.imageUrl);
      setValue("imagePublicId", prediction.imagePublicId);
      setValue("confidence", prediction.confidence);

      const isFallback = prediction.rawLabel === "unknown" || prediction.confidence === 0;
      if (isFallback) {
        setError("root", { message: "Couldn't analyze image. Please fill details manually." });
      } else {
        setValue("predictedCategory", prediction.predictedCategory);
        setValue("category", prediction.predictedCategory as WardrobeCategory);
        if (prediction.rawLabel && prediction.rawLabel !== "unknown") setValue("subcategory", titleCase(prediction.rawLabel));
      }

      if (prediction.primaryColor && prediction.primaryColor !== "unknown") setValue("color", prediction.primaryColor);
      setSecondaryColors(prediction.secondaryColors ?? []);
    } catch (err) {
      setError("root", { message: "Analysis failed. Please fill the details manually." });
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
        imageUri: values.imageUrl ? undefined : values.imageUri,
        imageUrl: values.imageUrl,
        imagePublicId: values.imagePublicId,
        category: values.category,
        subcategory: values.subcategory,
        color: values.color,
        tags: values.tagsText?.split(",").map((t) => t.trim()).filter(Boolean) ?? tags,
        occasion: values.occasion,
        season: values.season,
        notes: values.notes,
        predictedCategory: values.predictedCategory,
        confidence: values.confidence
      });
      navigation.dispatch(CommonActions.navigate("MainTabs", { screen: "Wardrobe" }));
    } catch (error) {
      setError("root", { message: getApiErrorMessage(error) });
    }
  });

  return (
    <Screen>
      <View style={styles.hero}>
        <EditorialText variant="label" tone="gold" uppercase>
          Vision Intake
        </EditorialText>
        <EditorialText variant="headline" style={styles.title}>
          AI Scan
        </EditorialText>
        <EditorialText variant="bodySmall" tone="ivoryMuted" style={styles.subtitle}>
          Upload a garment. The existing Cloudinary and AI prediction pipeline remains the source of truth.
        </EditorialText>
      </View>

      <View style={styles.scanner}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
        ) : (
          <View style={styles.emptyPreview}>
            <Ionicons name="scan-outline" size={42} color={colors.gold} />
            <EditorialText variant="label" tone="silver" uppercase style={styles.emptyLabel}>
              Awaiting garment
            </EditorialText>
          </View>
        )}
        <View style={styles.cornerTopLeft} />
        <View style={styles.cornerTopRight} />
        <View style={styles.cornerBottomLeft} />
        <View style={styles.cornerBottomRight} />
        {isPredicting ? (
          <View style={styles.analysisOverlay}>
            <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanTranslate }] }]} />
            <ActivityIndicator color={colors.ivory} size="large" />
            <EditorialText variant="label" tone="gold" uppercase style={styles.loadingText}>
              Analyzing fabric, color, silhouette
            </EditorialText>
          </View>
        ) : null}
      </View>

      <View style={styles.sourceRow}>
        <Button style={styles.sourceButton} label="Gallery" icon="image-outline" variant="secondary" onPress={() => pickImage("library")} disabled={isPredicting} />
        <Button style={styles.sourceButton} label="Camera" icon="camera-outline" variant="secondary" onPress={() => pickImage("camera")} disabled={isPredicting} />
      </View>

      {hasAnalysis ? (
        <EditorialCard style={styles.resultCard} elevated>
          <View style={styles.resultHeader}>
            <View style={{ flex: 1 }}>
              <EditorialText variant="label" tone="silver" uppercase>
                AI Classification
              </EditorialText>
              <EditorialText variant="headlineSmall" style={styles.resultTitle}>
                {categoryLabels[predictedCategory as WardrobeCategory]} / {subcategory || "Detected Piece"}
              </EditorialText>
            </View>
            <View style={styles.confidence}>
              <Ionicons name="ribbon-outline" size={18} color={colors.gold} />
              <EditorialText variant="headlineSmall" tone="gold">
                {Math.round((confidence ?? 0) * 100)}%
              </EditorialText>
            </View>
          </View>
          <View style={styles.resultGrid}>
            <View style={styles.resultPanel}>
              <EditorialText variant="label" tone="stone" uppercase>
                Color Palette
              </EditorialText>
              <PaletteDots colors={palette} />
            </View>
            <View style={styles.resultPanel}>
              <EditorialText variant="label" tone="stone" uppercase>
                Detected Fabric
              </EditorialText>
              <EditorialText variant="body" style={styles.fabric}>
                {fabric}
              </EditorialText>
            </View>
          </View>
          <ProgressBar value={Math.round((confidence ?? 0) * 100)} label="Model confidence" detail="Saved with prediction hints for backend correction tracking." />
          <View style={styles.autoTags}>
            {tags.map((tag) => (
              <Chip key={tag} label={tag} selected compact />
            ))}
          </View>
        </EditorialCard>
      ) : null}

      <EditorialCard style={styles.form}>
        <EditorialText variant="label" tone="gold" uppercase>
          Metadata
        </EditorialText>

        <View>
          <EditorialText variant="caption" tone="stone" uppercase>
            Category
          </EditorialText>
          <View style={styles.wrap}>
            {categories.map((item) => (
              <Chip key={item} label={categoryLabels[item]} selected={selectedCategory === item} onPress={() => setValue("category", item)} />
            ))}
          </View>
        </View>

        <Controller control={control} name="subcategory" render={({ field: { onChange, value } }) => <Input label="Subcategory" placeholder="Oxford shirt, denim, loafers" value={value} onChangeText={onChange} />} />
        <Controller control={control} name="color" render={({ field: { onChange, value } }) => <Input label="Color" placeholder="Black, ivory, navy" value={value} onChangeText={onChange} />} />
        <Controller control={control} name="tagsText" render={({ field: { onChange, value } }) => <Input label="Tags" placeholder="classic, wool, evening" value={value} onChangeText={onChange} />} />

        <View>
          <EditorialText variant="caption" tone="stone" uppercase>
            Occasion
          </EditorialText>
          <View style={styles.wrap}>
            {occasions.map((occasion) => (
              <Chip key={occasion} label={occasion} selected={selectedOccasions.includes(occasion)} onPress={() => setValue("occasion", toggleValue(selectedOccasions, occasion))} />
            ))}
          </View>
          {errors.occasion?.message ? (
            <EditorialText variant="caption" tone="oxblood">
              {errors.occasion.message}
            </EditorialText>
          ) : null}
        </View>

        <View>
          <EditorialText variant="caption" tone="stone" uppercase>
            Season
          </EditorialText>
          <View style={styles.wrap}>
            {seasons.map((season) => (
              <Chip key={season} label={season} selected={selectedSeasons.includes(season)} onPress={() => setValue("season", toggleValue(selectedSeasons, season))} />
            ))}
          </View>
        </View>

        <Controller control={control} name="notes" render={({ field: { onChange, value } }) => <Input label="Notes" multiline placeholder="Fit, fabric, styling notes" value={value} onChangeText={onChange} />} />

        {errors.root?.message ? (
          <EditorialText variant="caption" tone="oxblood">
            {errors.root.message}
          </EditorialText>
        ) : null}

        <Button label="Add to Wardrobe" loading={isSubmitting || createItem.isPending || isPredicting} onPress={onSubmit} icon="add-circle-outline" />
      </EditorialCard>
    </Screen>
  );
}

function titleCase(value: string) {
  return value.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildTags(category: WardrobeCategory, subcategory?: string, color?: string, season: Season[] = []) {
  return [category, subcategory?.split(" ")[0], color, season[0], "AI tagged"]
    .filter((value): value is string => Boolean(value))
    .slice(0, 5);
}

function inferFabric(category: WardrobeCategory, subcategory?: string) {
  const value = `${category} ${subcategory ?? ""}`.toLowerCase();
  if (value.includes("denim")) return "Cotton Denim";
  if (value.includes("coat") || value.includes("outerwear")) return "Wool Blend";
  if (value.includes("shirt") || value.includes("top")) return "Cotton Poplin";
  if (value.includes("shoe") || value.includes("loafer")) return "Calf Leather";
  if (value.includes("accessor")) return "Polished Metal";
  return "Structured Textile";
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

const cornerBase = {
  position: "absolute" as const,
  width: 58,
  height: 58,
  borderColor: colors.gold
};

const styles = StyleSheet.create({
  hero: {
    paddingTop: spacing.md
  },
  title: {
    marginTop: spacing.sm
  },
  subtitle: {
    marginTop: spacing.sm
  },
  scanner: {
    marginTop: spacing.xxl,
    aspectRatio: 0.82,
    borderRadius: radii.lg,
    overflow: "hidden",
    backgroundColor: colors.charcoal,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.floating
  },
  preview: {
    width: "100%",
    height: "100%"
  },
  emptyPreview: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.matte
  },
  emptyLabel: {
    marginTop: spacing.lg
  },
  cornerTopLeft: {
    ...cornerBase,
    top: spacing.lg,
    left: spacing.lg,
    borderTopWidth: 2,
    borderLeftWidth: 2
  },
  cornerTopRight: {
    ...cornerBase,
    top: spacing.lg,
    right: spacing.lg,
    borderTopWidth: 2,
    borderRightWidth: 2
  },
  cornerBottomLeft: {
    ...cornerBase,
    bottom: spacing.lg,
    left: spacing.lg,
    borderBottomWidth: 2,
    borderLeftWidth: 2
  },
  cornerBottomRight: {
    ...cornerBase,
    bottom: spacing.lg,
    right: spacing.lg,
    borderBottomWidth: 2,
    borderRightWidth: 2
  },
  analysisOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.52)"
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.gold,
    shadowColor: colors.gold,
    shadowOpacity: 0.8,
    shadowRadius: 12
  },
  loadingText: {
    marginTop: spacing.lg,
    textAlign: "center"
  },
  sourceRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.md
  },
  sourceButton: {
    flex: 1
  },
  resultCard: {
    marginTop: spacing.xxl,
    padding: spacing.xl,
    gap: spacing.lg
  },
  resultHeader: {
    flexDirection: "row",
    gap: spacing.lg
  },
  resultTitle: {
    marginTop: spacing.sm
  },
  confidence: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm
  },
  resultGrid: {
    flexDirection: "row",
    gap: spacing.md
  },
  resultPanel: {
    flex: 1,
    minHeight: 108,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.charcoalHigh,
    borderRadius: radii.md,
    padding: spacing.md,
    justifyContent: "space-between"
  },
  fabric: {
    marginTop: spacing.md
  },
  autoTags: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  form: {
    marginTop: spacing.section,
    padding: spacing.xl,
    gap: spacing.lg
  },
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.sm
  }
});
