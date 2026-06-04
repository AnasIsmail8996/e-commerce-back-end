import cloudinary from "../config/cloudinary";
import streamifier from "streamifier";

const uploadToCloudinary = (
  buffer: Buffer,
  folder: string
): Promise<{ url: string; publicId: string }> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result!.secure_url, publicId: result!.public_id });
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

export const uploadMultiple = async (files: Express.Multer.File[], folder: string) => {
  const results = await Promise.all(
    files.map((file) => uploadToCloudinary(file.buffer, folder))
  );
  return results;
};

export default uploadToCloudinary;
