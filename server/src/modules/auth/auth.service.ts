import crypto from "crypto";
import { env } from "../../config/env";
import { AppError } from "../../common/utils/AppError";
import { comparePassword, hashPassword } from "../../common/utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../common/utils/jwt";
import { userRepository } from "../users/user.repository";
import type {
  forgotPasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  resetPasswordSchema
} from "./auth.validators";
import type { z } from "zod";

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;
type RefreshInput = z.infer<typeof refreshSchema>;
type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

function buildTokenPair(user: { id: string; email: string; role?: string }) {
  const payload = { sub: user.id, email: user.email, role: user.role ?? "user" };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload)
  };
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw new AppError("Email is already registered", 409);

    const user = await userRepository.create({
      name: input.name,
      email: input.email.toLowerCase(),
      password: await hashPassword(input.password)
    });

    const tokens = buildTokenPair({ id: user.id, email: user.email, role: user.role });
    user.refreshTokenHash = await hashPassword(tokens.refreshToken);
    await user.save();

    return { user, tokens };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email, true);
    if (!user || !(await comparePassword(input.password, user.password))) {
      throw new AppError("Invalid email or password", 401);
    }

    const tokens = buildTokenPair({ id: user.id, email: user.email, role: user.role });
    user.refreshTokenHash = await hashPassword(tokens.refreshToken);
    await user.save();

    return { user: user.toJSON(), tokens };
  },

  async refresh(input: RefreshInput) {
    const payload = verifyRefreshToken(input.refreshToken);
    const user = await userRepository.findById(payload.sub, true);

    if (!user?.refreshTokenHash || !(await comparePassword(input.refreshToken, user.refreshTokenHash))) {
      throw new AppError("Invalid refresh token", 401);
    }

    const tokens = buildTokenPair({ id: user.id, email: user.email, role: user.role });
    user.refreshTokenHash = await hashPassword(tokens.refreshToken);
    await user.save();

    return { user: user.toJSON(), tokens };
  },

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await userRepository.findByEmail(input.email, true);
    if (!user) return { resetToken: null };

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    return { resetToken: env.NODE_ENV === "production" ? null : resetToken };
  },

  async resetPassword(input: ResetPasswordInput) {
    const tokenHash = crypto.createHash("sha256").update(input.token).digest("hex");
    const user = await userRepository.findByResetTokenHash(tokenHash);

    if (!user) throw new AppError("Invalid or expired reset token", 400);

    user.password = await hashPassword(input.password);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokenHash = undefined;
    await user.save();

    return true;
  }
};
