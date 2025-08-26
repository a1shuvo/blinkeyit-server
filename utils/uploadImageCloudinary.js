/**
 * Utility: uploadImageCloudinary
 * ----------------------------------
 * This utility uploads an image buffer (from multer or browser) to Cloudinary.
 * It:
 *  - Accepts an image from multer (with .buffer) or browser File/Blob (with .arrayBuffer),
 *  - Converts the image into a Buffer,
 *  - Streams the buffer to Cloudinary,
 *  - Stores the image under a predefined folder ("blienkeyit"),
 *  - Returns the Cloudinary upload result (URL, public_id, etc.).
 */

import { v2 as cloudinary } from "cloudinary";

// Cloudinary configuration (read from environment variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Uploads an image to Cloudinary
 * @param {Object|File|Blob} image - Multer file object (Node.js) or File/Blob (browser)
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadImageCloudinary = async (image) => {
  if (!image) {
    throw new Error("No image provided for upload");
  }

  // Ensure we always get a Buffer (handles both multer and browser uploads)
  const buffer = image.buffer
    ? image.buffer // multer file (Node.js backend)
    : Buffer.from(await image.arrayBuffer()); // browser File/Blob

  try {
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "blienkeyit" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return uploadResult;
  } catch (error) {
    throw new Error(error.message || "Cloudinary upload failed");
  }
};

export default uploadImageCloudinary;
