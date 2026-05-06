import type { Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import { AppError } from "../../common/utils/AppError";
import type { AuthenticatedRequest } from "../../common/middleware/auth";
import { uploadBufferToCloudinary } from "./upload.service";

export const uploadController = {
  image: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file) throw new AppError("Image file is required", 400);
    const upload = await uploadBufferToCloudinary(req.file, `wardrobe-iq/${req.user!.id}`);
    res.status(201).json({ success: true, data: upload });
  })
};
