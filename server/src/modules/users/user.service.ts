import { AppError } from "../../common/utils/AppError";
import { userRepository } from "./user.repository";
import type { updatePreferencesSchema, updateProfileSchema } from "./user.validators";
import type { z } from "zod";

type ProfileInput = z.infer<typeof updateProfileSchema>;
type PreferencesInput = z.infer<typeof updatePreferencesSchema>;

export const userService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    return user;
  },

  async updateProfile(userId: string, input: ProfileInput) {
    const user = await userRepository.updateById(userId, input);
    if (!user) throw new AppError("User not found", 404);
    return user;
  },

  async updatePreferences(userId: string, input: PreferencesInput) {
    const user = await userRepository.updateById(userId, { preferences: input });
    if (!user) throw new AppError("User not found", 404);
    return user;
  }
};
