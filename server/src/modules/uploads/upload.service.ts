import { Readable } from "stream";
import { cloudinary } from "../../config/cloudinary";
import { env } from "../../config/env";
import { AppError } from "../../common/utils/AppError";

type UploadResult = {
  publicId: string;
  imageUrl: string;
  width?: number;
  height?: number;
  format?: string;
};

export function uploadBufferToCloudinary(file: Express.Multer.File, folder = env.CLOUDINARY_FOLDER) {
  return new Promise<UploadResult>((resolve, reject) => {
    let isDone = false;
    const timeoutId = setTimeout(() => {
      if (isDone) return;
      isDone = true;
      reject(new AppError("Cloudinary upload timed out after 10 seconds", 504));
    }, 10_000);

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ quality: "auto" }, { fetch_format: "auto" }]
      },
      (error, result) => {
        if (isDone) return;
        isDone = true;
        clearTimeout(timeoutId);

        if (error || !result) {
          reject(new AppError("Image upload failed", 502, error));
          return;
        }

        resolve({
          publicId: result.public_id,
          imageUrl: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format
        });
      }
    );

    Readable.from(file.buffer).pipe(stream);
  });
}
