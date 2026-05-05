import type { Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import type { AuthenticatedRequest } from "../../common/middleware/auth";
import { userService } from "./user.service";

export const userController = {
  getProfile: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const profile = await userService.getProfile(req.user!.id);
    res.json({ success: true, data: profile });
  }),

  updateProfile: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const profile = await userService.updateProfile(req.user!.id, req.body);
    res.json({ success: true, data: profile });
  }),

  updatePreferences: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const profile = await userService.updatePreferences(req.user!.id, req.body);
    res.json({ success: true, data: profile.preferences });
  })
};
