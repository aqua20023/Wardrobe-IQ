import type { Response } from "express";
import { asyncHandler } from "../../common/utils/asyncHandler";
import type { AuthenticatedRequest } from "../../common/middleware/auth";
import { outfitService } from "./outfit.service";
import type { OutfitQuery } from "./outfit.validators";

export const outfitController = {
  create: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const outfit = await outfitService.create(req.user!.id, req.body);
    res.status(201).json({ success: true, data: outfit });
  }),

  list: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const data = await outfitService.list(req.user!.id, req.query as unknown as OutfitQuery);
    res.json({ success: true, data });
  }),

  get: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const outfit = await outfitService.get(req.user!.id, req.params.id);
    res.json({ success: true, data: outfit });
  }),

  update: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const outfit = await outfitService.update(req.user!.id, req.params.id, req.body);
    res.json({ success: true, data: outfit });
  }),

  remove: asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await outfitService.remove(req.user!.id, req.params.id);
    res.status(204).send();
  })
};
