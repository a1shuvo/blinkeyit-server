/**
 * Controller: uploadImageController
 * ---------------------------------
 * Uploads an image to Cloudinary and returns the uploaded file details.
 */
import uploadImageCloudinary from "../utils/uploadImageCloudinary.js";

const uploadImageController = async (req, res) => {
  try {
    const file = req.file;

    // Validate file
    if (!file) {
      return res.status(400).json({
        message: "No file provided",
        error: true,
        success: false,
      });
    }

    // Upload to Cloudinary
    const uploadedImage = await uploadImageCloudinary(file);

    // Success response
    return res.status(200).json({
      message: "Image uploaded successfully",
      data: uploadedImage,
      success: true,
      error: false,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Internal Server Error",
      error: true,
      success: false,
    });
  }
};

export default uploadImageController;
