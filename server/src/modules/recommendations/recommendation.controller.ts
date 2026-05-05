import type { Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import type { AuthenticatedRequest } from "../../common/middleware/auth";
import { recommendationService } from "./recommendation.service";
import type { RecommendationQuery } from "./recommendation.validators";

export const recommendationController = {
  outfits: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const suggestions = await recommendationService.getSuggestedOutfits(req.user!.id, req.query as unknown as RecommendationQuery);
    res.json({ success: true, data: suggestions });
  })
};
