import { Schema, Types, model, type HydratedDocument, type InferSchemaType } from "mongoose";

export const feedbackActions = ["like", "dislike", "save", "worn"] as const;

const feedbackSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
    outfitId: { type: Types.ObjectId, ref: "Outfit", required: true, index: true },
    action: { type: String, enum: feedbackActions, required: true }
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

feedbackSchema.index({ userId: 1, outfitId: 1, createdAt: -1 });

feedbackSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const output = ret as { _id?: { toString(): string }; id?: string };
    output.id = output._id?.toString();
    delete output._id;
    return ret;
  }
});

export type Feedback = InferSchemaType<typeof feedbackSchema>;
export type FeedbackDocument = HydratedDocument<Feedback>;
export const FeedbackModel = model<Feedback>("Feedback", feedbackSchema);
