/**
 * Middleware: upload
 * ----------------------------------
 * This middleware handles file uploads using multer.
 * It stores files in memory as Buffer objects (instead of saving to disk),
 * making it useful for direct uploads to cloud storage services like Cloudinary or S3.
 */

import multer from "multer";

// Configure multer to store files in memory
const storage = multer.memoryStorage();

// Initialize multer with memory storage
const upload = multer({ storage });

export default upload;
