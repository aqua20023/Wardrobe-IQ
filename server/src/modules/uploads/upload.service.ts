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
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [{ quality: "auto" }, { fetch_format: "auto" }]
      },
      (error, result) => {
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
