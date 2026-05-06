import { apiClient } from "./client";
import type { AiPrediction, ApiEnvelope, ClothingItem, Occasion, PaginatedWardrobe, Season, WardrobeCategory } from "../types/domain";

export type WardrobeQuery = {
  category?: WardrobeCategory;
  color?: string;
  occasion?: Occasion;
  season?: Season;
  search?: string;
  sort?: "newest" | "oldest" | "most-used" | "least-used";
};

export type ClothingItemInput = {
  imageUri?: string;
  imageUrl?: string;
  imagePublicId?: string;
  category: WardrobeCategory;
  subcategory?: string;
  color?: string;
  tags: string[];
  occasion: Occasion[];
  season: Season[];
  notes?: string;
  // AI correction tracking — echoed back from the prediction step
  predictedCategory?: WardrobeCategory | "unknown";
  confidence?: number;
};

function appendArray(form: FormData, key: string, values: string[]) {
  values.forEach((value) => form.append(key, value));
}

function toFormData(input: ClothingItemInput) {
  const form = new FormData();

  if (input.imageUri) {
    const name = input.imageUri.split("/").pop() ?? "wardrobe-item.jpg";
    const ext = name.split(".").pop()?.toLowerCase();
    form.append("image", {
      uri: input.imageUri,
      name,
      type: ext === "png" ? "image/png" : "image/jpeg"
    } as unknown as Blob);
  }

  if (input.imageUrl) form.append("imageUrl", input.imageUrl);
  form.append("category", input.category);
  if (input.subcategory) form.append("subcategory", input.subcategory);
  if (input.color) form.append("color", input.color);
  appendArray(form, "tags", input.tags);
  appendArray(form, "occasion", input.occasion);
  appendArray(form, "season", input.season);
  if (input.notes) form.append("notes", input.notes);
  // Echo AI hint fields so the backend can detect corrections
  if (input.predictedCategory) form.append("predictedCategory", input.predictedCategory);
  if (input.confidence !== undefined) form.append("confidence", String(input.confidence));

  return form;
}

function imageUriToFormData(imageUri: string): FormData {
  const form = new FormData();
  const name = imageUri.split("/").pop() ?? "wardrobe-item.jpg";
  const ext = name.split(".").pop()?.toLowerCase();
  form.append("image", {
    uri: imageUri,
    name,
    type: ext === "png" ? "image/png" : "image/jpeg"
  } as unknown as Blob);
  return form;
}

export const wardrobeApi = {
  async list(query: WardrobeQuery = {}) {
    const response = await apiClient.get<ApiEnvelope<PaginatedWardrobe>>("/wardrobe", { params: query });
    return response.data.data;
  },

  async detail(id: string) {
    const response = await apiClient.get<ApiEnvelope<ClothingItem>>(`/wardrobe/${id}`);
    return response.data.data;
  },

  async create(input: ClothingItemInput) {
    const response = await apiClient.post<ApiEnvelope<ClothingItem>>("/wardrobe", toFormData(input), {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data.data;
  },

  async update(id: string, input: ClothingItemInput) {
    const response = await apiClient.patch<ApiEnvelope<ClothingItem>>(`/wardrobe/${id}`, toFormData(input), {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data.data;
  },

  async remove(id: string) {
    await apiClient.delete(`/wardrobe/${id}`);
  },

  /** Upload image → Cloudinary → AI without persisting a ClothingItem. */
  async predictFromImage(imageUri: string) {
    const response = await apiClient.post<ApiEnvelope<AiPrediction>>("/wardrobe/predict", imageUriToFormData(imageUri), {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return response.data.data;
  }
};
