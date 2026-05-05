import multer from "multer";
import { AppError } from "../utils/AppError";

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new AppError("Only image uploads are supported", 400));
      return;
    }
    callback(null, true);
  }
});
