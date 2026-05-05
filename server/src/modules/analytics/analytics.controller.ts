import type { Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import type { AuthenticatedRequest } from "../../common/middleware/auth";
import { analyticsService } from "./analytics.service";

export const analyticsController = {
  wardrobe: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const stats = await analyticsService.wardrobeStats(req.user!.id);
    res.json({ success: true, data: stats });
  })
};
