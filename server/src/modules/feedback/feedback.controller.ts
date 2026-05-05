import type { Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import type { AuthenticatedRequest } from "../../common/middleware/auth";
import { feedbackService } from "./feedback.service";

export const feedbackController = {
  create: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const feedback = await feedbackService.create(req.user!.id, req.body);
    res.status(201).json({ success: true, data: feedback });
  }),

  list: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const feedback = await feedbackService.list(req.user!.id);
    res.json({ success: true, data: feedback });
  })
};
