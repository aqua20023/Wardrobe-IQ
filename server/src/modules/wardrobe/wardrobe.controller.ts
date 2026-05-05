import type { Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import type { AuthenticatedRequest } from "../../common/middleware/auth";
import { wardrobeService } from "./wardrobe.service";
import type { WardrobeQuery } from "./wardrobe.validators";

export const wardrobeController = {
  create: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await wardrobeService.create(req.user!.id, req.body, req.file);
    res.status(201).json({ success: true, data: item });
  }),

  list: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const data = await wardrobeService.list(req.user!.id, req.query as unknown as WardrobeQuery);
    res.json({ success: true, data });
  }),

  get: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await wardrobeService.get(req.user!.id, req.params.id);
    res.json({ success: true, data: item });
  }),

  update: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const item = await wardrobeService.update(req.user!.id, req.params.id, req.body, req.file);
    res.json({ success: true, data: item });
  }),

  remove: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await wardrobeService.remove(req.user!.id, req.params.id);
    res.status(204).send();
  })
};
