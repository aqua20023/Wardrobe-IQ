import { Router } from "express";
import { authenticate } from "../../common/middleware/auth";
import { analyticsController } from "./analytics.controller";

export const analyticsRoutes = Router();

analyticsRoutes.use(authenticate);
analyticsRoutes.get("/wardrobe", analyticsController.wardrobe);
