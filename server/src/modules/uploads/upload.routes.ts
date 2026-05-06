import { Router } from "express";
import { authenticate } from "../../common/middleware/auth";
import { imageUpload } from "../../common/middleware/upload";
import { uploadController } from "./upload.controller";

export const uploadRoutes = Router();

uploadRoutes.post("/image", authenticate, imageUpload.single("image"), uploadController.image);
