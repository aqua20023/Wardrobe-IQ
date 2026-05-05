import { Router } from "express";
import { authenticate } from "../../common/middleware/auth";
import { validate } from "../../common/middleware/validate";
import { recommendationController } from "./recommendation.controller";
import { recommendationQuerySchema } from "./recommendation.validators";

export const recommendationRoutes = Router();

recommendationRoutes.use(authenticate);
recommendationRoutes.get("/outfits", validate({ query: recommendationQuerySchema }), recommendationController.outfits);
