import { Schema, Types, model, type HydratedDocument, type InferSchemaType } from "mongoose";
import { occasions } from "../wardrobe/clothingItem.model";

const outfitSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    itemIds: [{ type: Types.ObjectId, ref: "ClothingItem", required: true }],
    title: { type: String, required: true, trim: true },
    occasion: { type: String, enum: occasions, default: "casual", index: true },
    notes: { type: String, trim: true },
    liked: { type: Boolean, default: false },
    saved: { type: Boolean, default: false, index: true },
    wornCount: { type: Number, default: 0 }
  },
  { timestamps: true, versionKey: false }
);

outfitSchema.index({ userId: 1, createdAt: -1 });
outfitSchema.index({ userId: 1, saved: 1 });

outfitSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const output = ret as { _id?: { toString(): string }; id?: string };
    output.id = output._id?.toString();
    delete output._id;
    return ret;
  }
});

export type Outfit = InferSchemaType<typeof outfitSchema>;
export type OutfitDocument = HydratedDocument<Outfit>;
export const OutfitModel = model<Outfit>("Outfit", outfitSchema);
