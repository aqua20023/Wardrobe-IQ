import { Router } from "express";
import { authenticate } from "../../common/middleware/auth";
import { imageUpload } from "../../common/middleware/upload";
import { validate } from "../../common/middleware/validate";
import { wardrobeController } from "./wardrobe.controller";
import { createClothingItemSchema, idParamSchema, updateClothingItemSchema, wardrobeQuerySchema } from "./wardrobe.validators";

export const wardrobeRoutes = Router();

wardrobeRoutes.use(authenticate);
wardrobeRoutes.get("/", validate({ query: wardrobeQuerySchema }), wardrobeController.list);
wardrobeRoutes.post("/", imageUpload.single("image"), validate({ body: createClothingItemSchema }), wardrobeController.create);
wardrobeRoutes.post("/predict", imageUpload.single("image"), wardrobeController.predict);
wardrobeRoutes.get("/:id", validate({ params: idParamSchema }), wardrobeController.get);
wardrobeRoutes.patch("/:id", imageUpload.single("image"), validate({ params: idParamSchema, body: updateClothingItemSchema }), wardrobeController.update);
wardrobeRoutes.delete("/:id", validate({ params: idParamSchema }), wardrobeController.remove);
