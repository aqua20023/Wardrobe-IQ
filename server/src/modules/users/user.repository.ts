import type { UpdateQuery } from "mongoose";
import { UserModel, type User } from "./user.model";

export const userRepository = {
  create(data: Partial<User>) {
    return UserModel.create(data);
  },

  findByEmail(email: string, includeSecrets = false) {
    const query = UserModel.findOne({ email: email.toLowerCase() });
    if (includeSecrets) query.select("+password +refreshTokenHash +passwordResetToken +passwordResetExpires");
    return query;
  },

  findById(id: string, includeSecrets = false) {
    const query = UserModel.findById(id);
    if (includeSecrets) query.select("+password +refreshTokenHash +passwordResetToken +passwordResetExpires");
    return query;
  },

  findByResetTokenHash(tokenHash: string) {
    return UserModel.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: new Date() }
    }).select("+password +refreshTokenHash +passwordResetToken +passwordResetExpires");
  },

  updateById(id: string, update: UpdateQuery<User>) {
    return UserModel.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  }
};
