import { Schema, model, type HydratedDocument, type InferSchemaType } from "mongoose";

const preferencesSchema = new Schema(
  {
    preferredColors: { type: [String], default: [] },
    preferredOccasions: { type: [String], default: [] },
    sizeProfile: {
      top: String,
      bottom: String,
      shoe: String
    },
    climate: String,
    notificationsEnabled: { type: Boolean, default: true }
  },
  { _id: false }
);

const styleProfileSchema = new Schema(
  {
    styleKeywords: { type: [String], default: [] },
    avoidKeywords: { type: [String], default: [] },
    favoriteBrands: { type: [String], default: [] }
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, select: false },
    avatar: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    preferences: { type: preferencesSchema, default: () => ({}) },
    styleProfile: { type: styleProfileSchema, default: () => ({}) },
    refreshTokenHash: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false }
  },
  { timestamps: true, versionKey: false }
);

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const output = ret as {
      _id?: { toString(): string };
      id?: string;
      password?: string;
      refreshTokenHash?: string;
      passwordResetToken?: string;
      passwordResetExpires?: Date;
    };
    output.id = output._id?.toString();
    delete output._id;
    delete output.password;
    delete output.refreshTokenHash;
    delete output.passwordResetToken;
    delete output.passwordResetExpires;
    return ret;
  }
});

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;
export const UserModel = model<User>("User", userSchema);
