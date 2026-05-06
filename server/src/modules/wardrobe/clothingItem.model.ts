import { Schema, Types, model, type HydratedDocument, type InferSchemaType } from "mongoose";

export const wardrobeCategories = [
  "tops",
  "bottoms",
  "outerwear",
  "shoes",
  "accessories",
  "dresses",
  "activewear",
  "other"
] as const;

export const occasions = ["casual", "formal", "work", "party", "travel", "workout", "date", "other"] as const;
export const seasons = ["spring", "summer", "fall", "winter", "all-season"] as const;

const clothingItemSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String },
    category: { type: String, enum: wardrobeCategories, required: true, index: true },
    subcategory: { type: String, trim: true },
    color: { type: String, trim: true, index: true },
    tags: { type: [String], default: [], index: true },
    occasion: { type: [String], enum: occasions, default: ["casual"], index: true },
    season: { type: [String], enum: seasons, default: ["all-season"], index: true },
    notes: { type: String, trim: true },
    usageCount: { type: Number, default: 0 },
    lastWorn: { type: Date },
    aiMetadata: {
      predictedCategory: { type: String },
      finalCategory: { type: String },
      confidence: { type: Number },
      userCorrected: { type: Boolean, default: false }
    }
  },
  { timestamps: true, versionKey: false }
);

clothingItemSchema.index({ userId: 1, category: 1, createdAt: -1 });
clothingItemSchema.index({ userId: 1, tags: 1 });
clothingItemSchema.index({ subcategory: "text", color: "text", tags: "text", notes: "text" });
// Supports future retraining queries: fetch all items where the user overrode the AI prediction
clothingItemSchema.index({ "aiMetadata.userCorrected": 1 });

clothingItemSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const output = ret as { _id?: { toString(): string }; id?: string };
    output.id = output._id?.toString();
    delete output._id;
    return ret;
  }
});

export type ClothingItem = InferSchemaType<typeof clothingItemSchema>;
export type ClothingItemDocument = HydratedDocument<ClothingItem>;
export const ClothingItemModel = model<ClothingItem>("ClothingItem", clothingItemSchema);
