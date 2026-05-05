import { Router } from "express";
import { authenticate } from "../../common/middleware/auth";
import { validate } from "../../common/middleware/validate";
import { feedbackController } from "./feedback.controller";
import { createFeedbackSchema } from "./feedback.validators";

export const feedbackRoutes = Router();

feedbackRoutes.use(authenticate);
feedbackRoutes.get("/", feedbackController.list);
feedbackRoutes.post("/", validate({ body: createFeedbackSchema }), feedbackController.create);
