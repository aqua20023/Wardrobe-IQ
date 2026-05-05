import { Router } from "express";
import { authenticate } from "../../common/middleware/auth";
import { validate } from "../../common/middleware/validate";
import { outfitController } from "./outfit.controller";
import { createOutfitSchema, idParamSchema, outfitQuerySchema, updateOutfitSchema } from "./outfit.validators";

export const outfitRoutes = Router();

outfitRoutes.use(authenticate);
outfitRoutes.get("/", validate({ query: outfitQuerySchema }), outfitController.list);
outfitRoutes.post("/", validate({ body: createOutfitSchema }), outfitController.create);
outfitRoutes.get("/:id", validate({ params: idParamSchema }), outfitController.get);
outfitRoutes.patch("/:id", validate({ params: idParamSchema, body: updateOutfitSchema }), outfitController.update);
outfitRoutes.delete("/:id", validate({ params: idParamSchema }), outfitController.remove);
