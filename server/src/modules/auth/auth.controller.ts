import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { authService } from "./auth.service";

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const data = await authService.register(req.body);
    res.status(201).json({ success: true, data });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const data = await authService.login(req.body);
    res.json({ success: true, data });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const data = await authService.refresh(req.body);
    res.json({ success: true, data });
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const data = await authService.forgotPassword(req.body);
    res.json({
      success: true,
      message: "If that email exists, reset instructions will be sent.",
      data
    });
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.resetPassword(req.body);
    res.json({ success: true, message: "Password reset successfully" });
  })
};
