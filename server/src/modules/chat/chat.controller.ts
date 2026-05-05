import type { Request, Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { chatService } from "./chat.service";

export const chatController = {
  message: asyncHandler(async (req: Request, res: Response) => {
    res.json({ success: true, data: chatService.respond(req.body) });
  })
};
