import type { FilterQuery } from "mongoose";
import { cacheDeleteByPrefix, cacheGet, cacheSet } from "../../config/redis";
import { AppError } from "../../common/utils/AppError";
import { uploadBufferToCloudinary } from "../uploads/upload.service";
import { predictCategory } from "../../services/ai.service";
import { ClothingItemModel, type ClothingItem } from "./clothingItem.model";
import { wardrobeRepository } from "./wardrobe.repository";
import type { createClothingItemSchema, updateClothingItemSchema, wardrobeQuerySchema } from "./wardrobe.validators";
import type { z } from "zod";

type CreateInput = z.infer<typeof createClothingItemSchema>;
type UpdateInput = z.infer<typeof updateClothingItemSchema>;
type QueryInput = z.infer<typeof wardrobeQuerySchema>;

const sortMap: Record<QueryInput["sort"], Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  "most-used": { usageCount: -1 },
  "least-used": { usageCount: 1 }
};

function buildFilter(userId: string, query: QueryInput): FilterQuery<ClothingItem> {
  const filter: FilterQuery<ClothingItem> = { userId };

  if (query.category) filter.category = query.category;
  if (query.color) filter.color = new RegExp(query.color, "i");
  if (query.occasion) filter.occasion = query.occasion;
  if (query.season) filter.season = query.season;
  if (query.search) {
    filter.$or = [
      { subcategory: new RegExp(query.search, "i") },
      { color: new RegExp(query.search, "i") },
      { tags: new RegExp(query.search, "i") },
      { notes: new RegExp(query.search, "i") }
    ];
  }

  return filter;
}

export const wardrobeService = {
  async create(userId: string, input: CreateInput, file?: Express.Multer.File) {
    let imageUrl = input.imageUrl;
    let imagePublicId: string | undefined;

    if (file) {
      const upload = await uploadBufferToCloudinary(file, `wardrobe-iq/${userId}/wardrobe`);
      imageUrl = upload.imageUrl;
      imagePublicId = upload.publicId;
    }

    if (!imageUrl) throw new AppError("Either image file or imageUrl is required", 400);

    // ── AI Metadata Resolution ────────────────────────────────────────────────
    // Strategy A: the client already showed the AI prediction to the user and
    //   passes predictedCategory + confidence back in the request body.
    //   We just check whether the user changed the category.
    //
    // Strategy B: no client-side hint → call the AI service server-side now.
    //   This keeps the feature working for API clients that don't surface the
    //   AI suggestion in the UI.
    let predictedCategory: string;
    let rawLabel: string;
    let confidence: number;

    if (input.predictedCategory !== undefined && input.confidence !== undefined) {
      // Client already surfaced the AI suggestion to the user and echoed it back.
      // predictedCategory here is already a mapped WardrobeCategory from a prior /predict call.
      predictedCategory = input.predictedCategory;
      rawLabel = input.predictedCategory; // client path has no separate raw label
      confidence = input.confidence;
    } else {
      // No client hint — run a live server-side prediction now.
      const aiPrediction = await predictCategory(imageUrl);
      predictedCategory = aiPrediction.category;  // mapped WardrobeCategory
      rawLabel = aiPrediction.rawLabel;            // original FastAPI label
      confidence = aiPrediction.confidence;
    }

    const finalCategory = input.category;
    const userCorrected = predictedCategory !== "other" && predictedCategory !== finalCategory;

    const aiMetadata = { predictedCategory, rawLabel, finalCategory, confidence, userCorrected };

    // Strip AI hint fields before persisting — they live in aiMetadata only
    const { predictedCategory: _pc, confidence: _conf, ...itemInput } = input;

    const item = await wardrobeRepository.create({
      ...itemInput,
      imageUrl,
      imagePublicId,
      userId,
      aiMetadata
    });
    await cacheDeleteByPrefix(`wardrobe:${userId}`);
    return item;
  },


  async list(userId: string, query: QueryInput) {
    const cacheKey = `wardrobe:${userId}:${JSON.stringify(query)}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return cached;

    const result = await wardrobeRepository.findForUser(buildFilter(userId, query), {
      page: query.page,
      limit: query.limit,
      sort: sortMap[query.sort]
    });

    await cacheSet(cacheKey, result, 90);
    return result;
  },

  async get(userId: string, id: string) {
    const item = await wardrobeRepository.findByIdForUser(id, userId);
    if (!item) throw new AppError("Clothing item not found", 404);
    return item;
  },

  async update(userId: string, id: string, input: UpdateInput, file?: Express.Multer.File) {
    const update: Partial<ClothingItem> = { ...input };

    if (file) {
      const upload = await uploadBufferToCloudinary(file, `wardrobe-iq/${userId}/wardrobe`);
      update.imageUrl = upload.imageUrl;
      update.imagePublicId = upload.publicId;
    }

    const item = await wardrobeRepository.updateByIdForUser(id, userId, update);
    if (!item) throw new AppError("Clothing item not found", 404);

    await cacheDeleteByPrefix(`wardrobe:${userId}`);
    return item;
  },

  async remove(userId: string, id: string) {
    const item = await wardrobeRepository.deleteByIdForUser(id, userId);
    if (!item) throw new AppError("Clothing item not found", 404);
    await cacheDeleteByPrefix(`wardrobe:${userId}`);
    return item;
  },

  async recent(userId: string, limit = 6) {
    return ClothingItemModel.find({ userId }).sort({ createdAt: -1 }).limit(limit);
  },

  /**
   * Upload image → Cloudinary → AI service, return prediction without persisting a ClothingItem.
   *
   * The client should display the suggestion to the user, let them confirm or correct it,
   * then submit POST /wardrobe with predictedCategory + confidence echoed back so the
   * backend can record whether the user corrected the AI.
   */
  async predict(userId: string, file: Express.Multer.File) {
    const upload = await uploadBufferToCloudinary(file, `wardrobe-iq/${userId}/wardrobe/preview`);
    const prediction = await predictCategory(upload.imageUrl);
    return {
      imageUrl: upload.imageUrl,
      imagePublicId: upload.publicId,
      /** Mapped wardrobe category — use this value in the create request body. */
      predictedCategory: prediction.category,
      /** Original FastAPI label before mapping — informational only. */
      rawLabel: prediction.rawLabel,
      confidence: prediction.confidence
    };
  }
};
