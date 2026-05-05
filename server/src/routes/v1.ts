import { Router } from "express";
import { analyticsRoutes } from "../modules/analytics/analytics.routes";
import { authRoutes } from "../modules/auth/auth.routes";
import { chatRoutes } from "../modules/chat/chat.routes";
import { feedbackRoutes } from "../modules/feedback/feedback.routes";
import { outfitRoutes } from "../modules/outfits/outfit.routes";
import { recommendationRoutes } from "../modules/recommendations/recommendation.routes";
import { uploadRoutes } from "../modules/uploads/upload.routes";
import { userRoutes } from "../modules/users/user.routes";
import { wardrobeRoutes } from "../modules/wardrobe/wardrobe.routes";

export const v1Routes = Router();

v1Routes.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", service: "wardrobe-iq-api" } });
});

v1Routes.use("/auth", authRoutes);
v1Routes.use("/users", userRoutes);
v1Routes.use("/wardrobe", wardrobeRoutes);
v1Routes.use("/outfits", outfitRoutes);
v1Routes.use("/recommendations", recommendationRoutes);
v1Routes.use("/feedback", feedbackRoutes);
v1Routes.use("/analytics", analyticsRoutes);
v1Routes.use("/uploads", uploadRoutes);
v1Routes.use("/chat", chatRoutes);
